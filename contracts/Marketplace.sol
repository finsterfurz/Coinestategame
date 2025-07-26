// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title Marketplace
 * @dev Virtual Building Empire NFT Marketplace Contract
 * @author Virtual Building Empire Team
 */
contract Marketplace is 
    Initializable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    IERC721Receiver
{
    // ===================================
    // ROLES
    // ===================================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ===================================
    // STRUCTS
    // ===================================
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 listedAt;
        bool active;
    }
    
    struct Offer {
        uint256 tokenId;
        address buyer;
        uint256 amount;
        uint256 expiry;
        bool active;
    }
    
    struct Sale {
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 fee;
        uint256 soldAt;
    }

    // ===================================
    // STATE VARIABLES
    // ===================================
    IERC721 public characterNFT;
    IERC20 public luncToken;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256) public userListingCount;
    
    uint256[] public activeListings;
    Sale[] public salesHistory;
    
    uint256 public marketplaceFee; // in basis points (100 = 1%)
    uint256 public minListingPrice;
    uint256 public maxListingPrice;
    uint256 public listingDuration;
    
    address public feeRecipient;
    
    uint256 private _listingCounter;
    
    // Events
    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price, uint256 listingId);
    event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ItemDelisted(uint256 indexed tokenId, address indexed seller);
    event OfferMade(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 expiry);
    event OfferAccepted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    event OfferCancelled(uint256 indexed tokenId, address indexed buyer, uint256 amount);
    event PriceUpdated(uint256 indexed tokenId, address indexed seller, uint256 oldPrice, uint256 newPrice);

    // ===================================
    // INITIALIZATION
    // ===================================
    function initialize(
        address characterNFTAddress,
        address luncTokenAddress,
        uint256 _marketplaceFee
    ) public initializer {
        __ReentrancyGuard_init();
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(UPGRADER_ROLE, _msgSender());
        _grantRole(PAUSER_ROLE, _msgSender());
        
        characterNFT = IERC721(characterNFTAddress);
        luncToken = IERC20(luncTokenAddress);
        
        marketplaceFee = _marketplaceFee; // e.g., 250 = 2.5%
        minListingPrice = 50 * 10**6; // 50 LUNC
        maxListingPrice = 1000000 * 10**6; // 1M LUNC
        listingDuration = 30 days;
        
        feeRecipient = _msgSender();
        _listingCounter = 1;
    }

    // ===================================
    // LISTING FUNCTIONS
    // ===================================
    function listItem(uint256 tokenId, uint256 price) external nonReentrant whenNotPaused {
        require(characterNFT.ownerOf(tokenId) == _msgSender(), "Not the owner");
        require(price >= minListingPrice && price <= maxListingPrice, "Price out of range");
        require(!listings[tokenId].active, "Already listed");
        require(
            characterNFT.isApprovedForAll(_msgSender(), address(this)) ||
            characterNFT.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );
        
        // Transfer NFT to marketplace
        characterNFT.safeTransferFrom(_msgSender(), address(this), tokenId);
        
        // Create listing
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: _msgSender(),
            price: price,
            listedAt: block.timestamp,
            active: true
        });
        
        activeListings.push(tokenId);
        userListings[_msgSender()].push(tokenId);
        userListingCount[_msgSender()]++;
        
        emit ItemListed(tokenId, _msgSender(), price, _listingCounter++);
    }
    
    function delistItem(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == _msgSender(), "Not the seller");
        
        // Mark as inactive
        listing.active = false;
        userListingCount[_msgSender()]--;
        
        // Remove from active listings
        _removeFromActiveListings(tokenId);
        
        // Return NFT to seller
        characterNFT.safeTransferFrom(address(this), _msgSender(), tokenId);
        
        emit ItemDelisted(tokenId, _msgSender());
    }
    
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == _msgSender(), "Not the seller");
        require(newPrice >= minListingPrice && newPrice <= maxListingPrice, "Price out of range");
        
        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        
        emit PriceUpdated(tokenId, _msgSender(), oldPrice, newPrice);
    }

    // ===================================
    // BUYING FUNCTIONS
    // ===================================
    function buyItem(uint256 tokenId) external nonReentrant whenNotPaused {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed or expired");
        require(listing.seller != _msgSender(), "Cannot buy own item");
        require(
            block.timestamp <= listing.listedAt + listingDuration,
            "Listing expired"
        );
        
        uint256 price = listing.price;
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Transfer LUNC from buyer
        require(
            luncToken.transferFrom(_msgSender(), listing.seller, sellerAmount),
            "Payment to seller failed"
        );
        
        if (fee > 0) {
            require(
                luncToken.transferFrom(_msgSender(), feeRecipient, fee),
                "Fee payment failed"
            );
        }
        
        // Transfer NFT to buyer
        characterNFT.safeTransferFrom(address(this), _msgSender(), tokenId);
        
        // Record sale
        salesHistory.push(Sale({
            tokenId: tokenId,
            seller: listing.seller,
            buyer: _msgSender(),
            price: price,
            fee: fee,
            soldAt: block.timestamp
        }));
        
        // Clean up
        address seller = listing.seller;
        listing.active = false;
        userListingCount[seller]--;
        _removeFromActiveListings(tokenId);
        _cancelAllOffers(tokenId);
        
        emit ItemSold(tokenId, seller, _msgSender(), price);
    }

    // ===================================
    // OFFER FUNCTIONS
    // ===================================
    function makeOffer(uint256 tokenId, uint256 amount, uint256 expiry) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount >= minListingPrice, "Offer too low");
        require(expiry > block.timestamp, "Invalid expiry");
        require(expiry <= block.timestamp + 30 days, "Expiry too far");
        require(characterNFT.ownerOf(tokenId) != _msgSender(), "Cannot offer on own item");
        
        // Check if user has enough balance
        require(luncToken.balanceOf(_msgSender()) >= amount, "Insufficient balance");
        
        // Cancel any existing offer from this buyer
        _cancelUserOffer(tokenId, _msgSender());
        
        // Create new offer
        offers[tokenId].push(Offer({
            tokenId: tokenId,
            buyer: _msgSender(),
            amount: amount,
            expiry: expiry,
            active: true
        }));
        
        emit OfferMade(tokenId, _msgSender(), amount, expiry);
    }
    
    function acceptOffer(uint256 tokenId, address buyer) external nonReentrant {
        require(characterNFT.ownerOf(tokenId) == _msgSender(), "Not the owner");
        
        // Find the offer
        Offer storage offer = _findActiveOffer(tokenId, buyer);
        require(offer.active, "Offer not found or expired");
        require(offer.expiry > block.timestamp, "Offer expired");
        
        uint256 amount = offer.amount;
        uint256 fee = (amount * marketplaceFee) / 10000;
        uint256 sellerAmount = amount - fee;
        
        // Transfer LUNC from buyer
        require(
            luncToken.transferFrom(buyer, _msgSender(), sellerAmount),
            "Payment to seller failed"
        );
        
        if (fee > 0) {
            require(
                luncToken.transferFrom(buyer, feeRecipient, fee),
                "Fee payment failed"
            );
        }
        
        // Transfer NFT to buyer
        characterNFT.safeTransferFrom(_msgSender(), buyer, tokenId);
        
        // Record sale
        salesHistory.push(Sale({
            tokenId: tokenId,
            seller: _msgSender(),
            buyer: buyer,
            price: amount,
            fee: fee,
            soldAt: block.timestamp
        }));
        
        // Clean up
        if (listings[tokenId].active) {
            listings[tokenId].active = false;
            userListingCount[_msgSender()]--;
            _removeFromActiveListings(tokenId);
        }
        _cancelAllOffers(tokenId);
        
        emit OfferAccepted(tokenId, _msgSender(), buyer, amount);
    }
    
    function cancelOffer(uint256 tokenId) external {
        _cancelUserOffer(tokenId, _msgSender());
        emit OfferCancelled(tokenId, _msgSender(), 0);
    }

    // ===================================
    // VIEW FUNCTIONS
    // ===================================
    function getActiveListings(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Listing[] memory) 
    {
        require(offset < activeListings.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > activeListings.length) {
            end = activeListings.length;
        }
        
        Listing[] memory result = new Listing[](end - offset);
        
        for (uint256 i = offset; i < end; i++) {
            uint256 tokenId = activeListings[i];
            if (listings[tokenId].active) {
                result[i - offset] = listings[tokenId];
            }
        }
        
        return result;
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        uint256[] memory userTokens = userListings[user];
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (listings[userTokens[i]].active) {
                activeCount++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (listings[userTokens[i]].active) {
                result[index] = userTokens[i];
                index++;
            }
        }
        
        return result;
    }
    
    function getOffers(uint256 tokenId) external view returns (Offer[] memory) {
        return offers[tokenId];
    }
    
    function getActiveOffers(uint256 tokenId) external view returns (Offer[] memory) {
        Offer[] memory allOffers = offers[tokenId];
        uint256 activeCount = 0;
        
        // Count active offers
        for (uint256 i = 0; i < allOffers.length; i++) {
            if (allOffers[i].active && allOffers[i].expiry > block.timestamp) {
                activeCount++;
            }
        }
        
        // Create result array
        Offer[] memory result = new Offer[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allOffers.length; i++) {
            if (allOffers[i].active && allOffers[i].expiry > block.timestamp) {
                result[index] = allOffers[i];
                index++;
            }
        }
        
        return result;
    }
    
    function getSalesHistory(uint256 offset, uint256 limit) 
        external 
        view 
        returns (Sale[] memory) 
    {
        require(offset < salesHistory.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > salesHistory.length) {
            end = salesHistory.length;
        }
        
        Sale[] memory result = new Sale[](end - offset);
        
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = salesHistory[salesHistory.length - 1 - i]; // Reverse order
        }
        
        return result;
    }
    
    function getMarketStats() external view returns (
        uint256 totalListings,
        uint256 totalSales,
        uint256 totalVolume,
        uint256 averagePrice
    ) {
        totalListings = activeListings.length;
        totalSales = salesHistory.length;
        
        if (totalSales > 0) {
            uint256 sumPrices = 0;
            for (uint256 i = 0; i < salesHistory.length; i++) {
                totalVolume += salesHistory[i].price;
                sumPrices += salesHistory[i].price;
            }
            averagePrice = sumPrices / totalSales;
        }
    }

    // ===================================
    // ADMIN FUNCTIONS
    // ===================================
    function setMarketplaceFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = newFee;
    }
    
    function setPriceRange(uint256 minPrice, uint256 maxPrice) external onlyRole(ADMIN_ROLE) {
        require(minPrice < maxPrice, "Invalid price range");
        minListingPrice = minPrice;
        maxListingPrice = maxPrice;
    }
    
    function setListingDuration(uint256 duration) external onlyRole(ADMIN_ROLE) {
        require(duration >= 1 days && duration <= 90 days, "Invalid duration");
        listingDuration = duration;
    }
    
    function setFeeRecipient(address newRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function emergencyDelist(uint256 tokenId) external onlyRole(ADMIN_ROLE) {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        
        listing.active = false;
        userListingCount[listing.seller]--;
        _removeFromActiveListings(tokenId);
        
        characterNFT.safeTransferFrom(address(this), listing.seller, tokenId);
        
        emit ItemDelisted(tokenId, listing.seller);
    }

    // ===================================
    // INTERNAL FUNCTIONS
    // ===================================
    function _removeFromActiveListings(uint256 tokenId) internal {
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == tokenId) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }
    
    function _cancelAllOffers(uint256 tokenId) internal {
        Offer[] storage tokenOffers = offers[tokenId];
        for (uint256 i = 0; i < tokenOffers.length; i++) {
            tokenOffers[i].active = false;
        }
    }
    
    function _cancelUserOffer(uint256 tokenId, address user) internal {
        Offer[] storage tokenOffers = offers[tokenId];
        for (uint256 i = 0; i < tokenOffers.length; i++) {
            if (tokenOffers[i].buyer == user && tokenOffers[i].active) {
                tokenOffers[i].active = false;
                break;
            }
        }
    }
    
    function _findActiveOffer(uint256 tokenId, address buyer) internal view returns (Offer storage) {
        Offer[] storage tokenOffers = offers[tokenId];
        for (uint256 i = 0; i < tokenOffers.length; i++) {
            if (tokenOffers[i].buyer == buyer && tokenOffers[i].active) {
                return tokenOffers[i];
            }
        }
        revert("Offer not found");
    }
    
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}