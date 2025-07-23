// 🔗 Virtual Building Empire - Web3 Service

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../constants/contracts';
import CharacterNFT_ABI from '../abi/CharacterNFT.json';
import LuncRewards_ABI from '../abi/LuncRewards.json';
import ERC20_ABI from '../abi/ERC20.json';

class Web3Service {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.connected = false;
        this.chainId = null;
    }

    /**
     * Initialize Web3 connection
     */
    async initialize() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                
                // Check if already connected
                const accounts = await this.provider.listAccounts();
                if (accounts.length > 0) {
                    await this.connect();
                }
                
                // Listen for account changes
                window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
                window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
                
                return true;
            } else {
                console.error('MetaMask not detected');
                return false;
            }
        } catch (error) {
            console.error('Web3 initialization failed:', error);
            return false;
        }
    }

    /**
     * Connect to MetaMask
     */
    async connect() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = this.provider.getSigner();
            this.connected = true;
            
            // Get network info
            const network = await this.provider.getNetwork();
            this.chainId = network.chainId;
            
            // Initialize contracts
            this.initializeContracts();
            
            console.log('🎮 Connected to Virtual Building Empire');
            return await this.signer.getAddress();
        } catch (error) {
            console.error('Connection failed:', error);
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.connected = false;
        this.chainId = null;
    }

    /**
     * Initialize smart contracts
     */
    initializeContracts() {
        if (!this.signer) {
            throw new Error('Wallet not connected');
        }

        this.contracts = {
            characterNFT: new ethers.Contract(
                CONTRACT_ADDRESSES.CHARACTER_NFT,
                CharacterNFT_ABI,
                this.signer
            ),
            luncRewards: new ethers.Contract(
                CONTRACT_ADDRESSES.LUNC_REWARDS,
                LuncRewards_ABI,
                this.signer
            ),
            luncToken: new ethers.Contract(
                CONTRACT_ADDRESSES.LUNC_TOKEN,
                ERC20_ABI,
                this.signer
            )
        };
    }

    /**
     * Handle account changes
     */
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.disconnect();
            window.location.reload(); // Refresh to update UI
        } else {
            await this.connect();
            window.location.reload();
        }
    }

    /**
     * Handle chain changes
     */
    handleChainChanged(chainId) {
        window.location.reload();
    }

    /**
     * Get current account address
     */
    async getCurrentAccount() {
        if (!this.signer) return null;
        return await this.signer.getAddress();
    }

    /**
     * Get account balance (ETH)
     */
    async getBalance(address = null) {
        if (!address) address = await this.getCurrentAccount();
        const balance = await this.provider.getBalance(address);
        return ethers.utils.formatEther(balance);
    }

    /**
     * Get LUNC balance
     */
    async getLuncBalance(address = null) {
        if (!address) address = await this.getCurrentAccount();
        const balance = await this.contracts.luncToken.balanceOf(address);
        return ethers.utils.formatEther(balance);
    }

    // ========================================
    // CHARACTER NFT FUNCTIONS
    // ========================================

    /**
     * Mint new character
     */
    async mintCharacter(name, department) {
        try {
            const mintPrice = await this.contracts.characterNFT.MINT_PRICE();
            
            const tx = await this.contracts.characterNFT.mintCharacter(
                await this.getCurrentAccount(),
                name,
                department,
                { value: mintPrice }
            );
            
            const receipt = await tx.wait();
            
            // Extract token ID from events
            const mintEvent = receipt.events.find(e => e.event === 'CharacterMinted');
            const tokenId = mintEvent?.args?.tokenId;
            
            return {
                success: true,
                tokenId: tokenId?.toString(),
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Mint character failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get family characters
     */
    async getFamilyCharacters(address = null) {
        if (!address) address = await this.getCurrentAccount();
        
        const tokenIds = await this.contracts.characterNFT.getFamilyCharacters(address);
        const characters = [];
        
        for (const tokenId of tokenIds) {
            const character = await this.contracts.characterNFT.getCharacter(tokenId);
            characters.push({
                tokenId: tokenId.toString(),
                name: character.name,
                type: this.getCharacterTypeName(character.characterType),
                department: this.getDepartmentName(character.department),
                level: character.level.toNumber(),
                experience: character.experience.toNumber(),
                happiness: character.happiness.toNumber(),
                isWorking: character.isWorking,
                currentJob: character.currentJob,
                dailyEarnings: ethers.utils.formatEther(character.dailyEarnings),
                lastWorkTimestamp: character.lastWorkTimestamp.toNumber()
            });
        }
        
        return characters;
    }

    /**
     * Assign job to character
     */
    async assignJob(tokenId, jobTitle, dailySalary) {
        try {
            const tx = await this.contracts.characterNFT.assignJob(
                tokenId,
                jobTitle,
                ethers.utils.parseEther(dailySalary.toString())
            );
            
            const receipt = await tx.wait();
            return {
                success: true,
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Assign job failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete work shift (gain experience)
     */
    async completeWorkShift(tokenId) {
        try {
            const tx = await this.contracts.characterNFT.completeWorkShift(tokenId);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Complete work shift failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Rest character (stop working)
     */
    async restCharacter(tokenId) {
        try {
            const tx = await this.contracts.characterNFT.restCharacter(tokenId);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Rest character failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ========================================
    // LUNC REWARDS FUNCTIONS
    // ========================================

    /**
     * Claim daily rewards
     */
    async claimDailyRewards() {
        try {
            const tx = await this.contracts.luncRewards.claimDailyRewards();
            const receipt = await tx.wait();
            
            // Calculate total claimed from events
            let totalClaimed = ethers.BigNumber.from(0);
            const salaryEvents = receipt.events.filter(e => e.event === 'SalaryPaid');
            
            for (const event of salaryEvents) {
                totalClaimed = totalClaimed.add(event.args.amount);
            }
            
            return {
                success: true,
                amount: ethers.utils.formatEther(totalClaimed),
                transactionHash: receipt.transactionHash
            };
        } catch (error) {
            console.error('Claim daily rewards failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get family stats
     */
    async getFamilyStats(address = null) {
        if (!address) address = await this.getCurrentAccount();
        
        const stats = await this.contracts.luncRewards.getFamilyStats(address);
        
        return {
            familySize: stats.familySize.toNumber(),
            workingCharacters: stats.workingCharacters.toNumber(),
            estimatedDailyEarnings: ethers.utils.formatEther(stats.estimatedDailyEarnings),
            totalEarned: ethers.utils.formatEther(stats.totalEarnedAmount)
        };
    }

    /**
     * Check if can claim today
     */
    async canClaimToday(address = null) {
        if (!address) address = await this.getCurrentAccount();
        
        const result = await this.contracts.luncRewards.canClaimToday(address);
        
        return {
            canClaim: result.canClaim,
            nextClaimTime: new Date(result.nextClaimTime.toNumber() * 1000)
        };
    }

    /**
     * Get job salary
     */
    async getJobSalary(jobTitle) {
        const salary = await this.contracts.luncRewards.getJobSalary(jobTitle);
        return ethers.utils.formatEther(salary);
    }

    /**
     * Get building efficiency
     */
    async getBuildingEfficiency() {
        const efficiency = await this.contracts.luncRewards.buildingEfficiency();
        return efficiency.toNumber();
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Get character type name
     */
    getCharacterTypeName(typeNumber) {
        const types = ['common', 'rare', 'legendary'];
        return types[typeNumber] || 'unknown';
    }

    /**
     * Get department name
     */
    getDepartmentName(deptNumber) {
        const departments = ['Management', 'Professional', 'Operations', 'Service'];
        return departments[deptNumber] || 'Unknown';
    }

    /**
     * Format error message for user
     */
    formatError(error) {
        if (error.code === 4001) {
            return 'Transaktion vom Benutzer abgebrochen';
        } else if (error.message.includes('insufficient funds')) {
            return 'Nicht genügend ETH für Transaktion';
        } else if (error.message.includes('Already claimed today')) {
            return 'Heute bereits Belohnungen erhalten';
        } else if (error.message.includes('Character already working')) {
            return 'Charakter arbeitet bereits';
        } else if (error.message.includes('Not character owner')) {
            return 'Du bist nicht der Besitzer dieses Charakters';
        } else {
            return error.message || 'Unbekannter Fehler';
        }
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(txHash, confirmations = 1) {
        return await this.provider.waitForTransaction(txHash, confirmations);
    }

    /**
     * Get gas price estimate
     */
    async getGasPrice() {
        const gasPrice = await this.provider.getGasPrice();
        return ethers.utils.formatUnits(gasPrice, 'gwei');
    }

    /**
     * Estimate gas for transaction
     */
    async estimateGas(contract, method, params = []) {
        try {
            const gasEstimate = await contract.estimateGas[method](...params);
            return gasEstimate.toString();
        } catch (error) {
            console.error('Gas estimation failed:', error);
            return null;
        }
    }
}

// Export singleton instance
const web3Service = new Web3Service();
export default web3Service;