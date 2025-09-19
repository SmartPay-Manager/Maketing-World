// src/services/api/xrp/xrplClient.ts
import { Client, Wallet, xrpToDrops, dropsToXrp } from 'xrpl';
import CryptoJS from 'crypto-js';
import type { XRPAtomicSwap } from '../../../types/api';

export class XRPLClient {
  private client: Client;
  private wallet: Wallet | null = null;
  private isConnected: boolean = false;

  constructor(server: string = 'wss://xrplcluster.com') {
    // Utiliser le cluster public XRPL pour le hackathon
    this.client = new Client(server);
  }

  // Connexion au réseau XRP
  async connect(): Promise<boolean> {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Connecté au XRP Ledger');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion XRP Ledger:', error);
      return false;
    }
  }

  // Déconnexion propre
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  // Importer un wallet XRP (pour les tests)
  importWallet(seed: string): void {
    this.wallet = Wallet.fromSeed(seed);
    console.log('Wallet XRP importé:', this.wallet.address);
  }

  // Générer un nouveau wallet (pour les démos)
  generateWallet(): { address: string; seed: string } {
    const wallet = Wallet.generate();
    this.wallet = wallet;
    return {
      address: wallet.address,
      seed: wallet.seed!
    };
  }

  // Récupérer le balance XRP d'une adresse
  async getBalance(address: string): Promise<string> {
    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });

      // Convertir drops en XRP (1 XRP = 1,000,000 drops)
      return dropsToXrp(response.result.account_data.Balance);
    } catch (error) {
      console.error('Erreur lors de la récupération du balance XRP:', error);
      return '0';
    }
  }

  // Créer un escrow XRP avec hashlock et timelock
  async createEscrow(
    destination: string,
    amount: string,
    secretHash: string,
    finishAfter: number,
    cancelAfter: number
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet non initialisé');
    }

    try {
      const escrowCreate = {
        TransactionType: 'EscrowCreate',
        Account: this.wallet.address,
        Destination: destination,
        Amount: xrpToDrops(amount),
        Condition: secretHash, // Hash du secret (hashlock)
        FinishAfter: finishAfter, // Timestamp minimum pour terminer
        CancelAfter: cancelAfter, // Timestamp après lequel on peut annuler
        Fee: '12', // Frais en drops (très faible)
      };

      // Signer et soumettre la transaction
      const prepared = await this.client.autofill(escrowCreate);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
        console.log('✅ Escrow XRP créé:', result.result.hash);
        return result.result.hash;
      } else {
        throw new Error(`Échec de création d'escrow: ${result.result.meta?.TransactionResult}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création d\'escrow XRP:', error);
      throw error;
    }
  }

  // Terminer un escrow en révélant le secret
  async finishEscrow(
    owner: string,
    offerSequence: number,
    condition: string,
    fulfillment: string
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet non initialisé');
    }

    try {
      const escrowFinish = {
        TransactionType: 'EscrowFinish',
        Account: this.wallet.address,
        Owner: owner,
        OfferSequence: offerSequence,
        Condition: condition,
        Fulfillment: fulfillment, // Le secret révélé
        Fee: '12',
      };

      const prepared = await this.client.autofill(escrowFinish);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
        console.log('✅ Escrow XRP terminé:', result.result.hash);
        return result.result.hash;
      } else {
        throw new Error(`Échec de finalisation d'escrow: ${result.result.meta?.TransactionResult}`);
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation d\'escrow XRP:', error);
      throw error;
    }
  }

  // Annuler un escrow après expiration
  async cancelEscrow(owner: string, offerSequence: number): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet non initialisé');
    }

    try {
      const escrowCancel = {
        TransactionType: 'EscrowCancel',
        Account: this.wallet.address,
        Owner: owner,
        OfferSequence: offerSequence,
        Fee: '12',
      };

      const prepared = await this.client.autofill(escrowCancel);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult === 'tesSUCCESS') {
        console.log('✅ Escrow XRP annulé:', result.result.hash);
        return result.result.hash;
      } else {
        throw new Error(`Échec d'annulation d'escrow: ${result.result.meta?.TransactionResult}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation d\'escrow XRP:', error);
      throw error;
    }
  }
}