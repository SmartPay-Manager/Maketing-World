// src/services/api/xrp/hashlock.ts
import CryptoJS from 'crypto-js';

/**
 * Service de gestion des hashlocks et timelocks pour les atomic swaps
 * 
 * Cette classe encapsule toute la logique cryptographique nécessaire pour
 * implémenter des atomic swaps sécurisés entre différentes blockchains.
 * Elle fournit les primitives de base qui seront utilisées par les couches
 * supérieures pour orchestrer les swaps cross-chain.
 */

// Interface pour représenter un hashlock complet avec ses métadonnées
export interface HashlockData {
  secret: string;           // Le secret original (gardé privé jusqu'à la révélation)
  hash: string;            // Le hash du secret (partagé publiquement)
  algorithm: string;       // L'algorithme de hashage utilisé
  createdAt: number;       // Timestamp de création pour le suivi
  expiresAt?: number;      // Timestamp d'expiration optionnel
}

// Interface pour les paramètres de timelock
export interface TimelockParams {
  finishAfter: number;     // Timestamp minimum pour terminer l'operation
  cancelAfter: number;     // Timestamp après lequel l'opération peut être annulée
  currentTime?: number;    // Timestamp actuel (pour les tests et simulations)
}

// Énumération des statuts possibles d'un timelock
export enum TimelockStatus {
  LOCKED = 'locked',           // Période d'attente, aucune action possible
  EXECUTABLE = 'executable',   // Peut être exécuté mais pas encore annulé
  EXPIRED = 'expired',         // Peut être annulé mais plus exécuté
  COMPLETED = 'completed',     // Déjà exécuté avec succès
  CANCELLED = 'cancelled'      // Déjà annulé
}

export class HashlockManager {
  private static readonly DEFAULT_SECRET_LENGTH = 32; // 32 bytes pour la sécurité
  private static readonly SUPPORTED_ALGORITHMS = ['SHA256', 'SHA512'];

  /**
   * Génère un nouveau hashlock avec un secret cryptographiquement sécurisé
   * 
   * Cette méthode crée un secret aléatoire et calcule son hash correspondant.
   * Le secret doit être gardé confidentiel jusqu'au moment de la révélation,
   * tandis que le hash peut être partagé publiquement pour établir l'engagement.
   */
  static generateHashlock(
    algorithm: string = 'SHA256',
    secretLength: number = HashlockManager.DEFAULT_SECRET_LENGTH
  ): HashlockData {
    // Validation des paramètres d'entrée
    if (!HashlockManager.SUPPORTED_ALGORITHMS.includes(algorithm)) {
      throw new Error(`Algorithme de hashage non supporté: ${algorithm}`);
    }

    if (secretLength < 16 || secretLength > 64) {
      throw new Error(`Longueur de secret invalide: ${secretLength}. Doit être entre 16 et 64 bytes.`);
    }

    // Génération d'un secret cryptographiquement sécurisé
    // Nous utilisons une combinaison de sources d'entropie pour maximiser la sécurité
    const timestamp = Date.now().toString();
    const randomBytes = CryptoJS.lib.WordArray.random(secretLength);
    const additionalEntropy = Math.random().toString(36).substring(2);
    
    // Combinaison des sources d'entropie pour créer le secret final
    const combinedEntropy = timestamp + randomBytes.toString() + additionalEntropy;
    const secret = CryptoJS.SHA256(combinedEntropy).toString().substring(0, secretLength * 2);

    // Calcul du hash selon l'algorithme spécifié
    let hash: string;
    switch (algorithm) {
      case 'SHA256':
        hash = CryptoJS.SHA256(secret).toString();
        break;
      case 'SHA512':
        hash = CryptoJS.SHA512(secret).toString();
        break;
      default:
        throw new Error(`Implémentation manquante pour l'algorithme: ${algorithm}`);
    }

    const hashlockData: HashlockData = {
      secret,
      hash,
      algorithm,
      createdAt: Date.now()
    };

    console.log(`✅ Hashlock généré avec ${algorithm}: ${hash.substring(0, 16)}...`);
    
    return hashlockData;
  }

  /**
   * Vérifie qu'un secret correspond bien à un hash donné
   * 
   * Cette méthode est cruciale pour la sécurité des atomic swaps car elle
   * permet de valider que la révélation du secret est authentique avant
   * de procéder au transfert des fonds.
   */
  static verifySecret(
    secret: string,
    expectedHash: string,
    algorithm: string = 'SHA256'
  ): boolean {
    try {
      // Validation des paramètres d'entrée
      if (!secret || !expectedHash || !algorithm) {
        console.error('❌ Paramètres manquants pour la vérification du secret');
        return false;
      }

      // Calcul du hash du secret fourni
      let calculatedHash: string;
      switch (algorithm) {
        case 'SHA256':
          calculatedHash = CryptoJS.SHA256(secret).toString();
          break;
        case 'SHA512':
          calculatedHash = CryptoJS.SHA512(secret).toString();
          break;
        default:
          console.error(`❌ Algorithme non supporté pour la vérification: ${algorithm}`);
          return false;
      }

      // Comparaison sécurisée des hashes
      const isValid = calculatedHash.toLowerCase() === expectedHash.toLowerCase();
      
      if (isValid) {
        console.log(`✅ Secret vérifié avec succès pour le hash: ${expectedHash.substring(0, 16)}...`);
      } else {
        console.warn(`⚠️ Échec de vérification du secret pour le hash: ${expectedHash.substring(0, 16)}...`);
      }

      return isValid;

    } catch (error) {
      console.error('❌ Erreur lors de la vérification du secret:', error);
      return false;
    }
  }

  /**
   * Évalue le statut actuel d'un timelock selon les timestamps
   * 
   * Cette méthode implémente la logique temporelle des atomic swaps,
   * déterminant si une opération peut être exécutée ou annulée selon
   * les contraintes de temps établies.
   */
  static evaluateTimelock(
    params: TimelockParams,
    currentStatus: string = 'active'
  ): { status: TimelockStatus; canExecute: boolean; canCancel: boolean; timeRemaining: number } {
    // Utilisation du timestamp actuel ou de celui fourni pour les tests
    const now = params.currentTime || Math.floor(Date.now() / 1000);
    
    // Si l'opération est déjà complétée ou annulée, retourner le statut existant
    if (currentStatus === 'completed') {
      return {
        status: TimelockStatus.COMPLETED,
        canExecute: false,
        canCancel: false,
        timeRemaining: 0
      };
    }

    if (currentStatus === 'cancelled') {
      return {
        status: TimelockStatus.CANCELLED,
        canExecute: false,
        canCancel: false,
        timeRemaining: 0
      };
    }

    // Évaluation de la logique temporelle
    const canExecute = now >= params.finishAfter && now < params.cancelAfter;
    const canCancel = now >= params.cancelAfter;
    const isLocked = now < params.finishAfter;

    let status: TimelockStatus;
    let timeRemaining: number;

    if (isLocked) {
      status = TimelockStatus.LOCKED;
      timeRemaining = params.finishAfter - now;
    } else if (canExecute) {
      status = TimelockStatus.EXECUTABLE;
      timeRemaining = params.cancelAfter - now;
    } else if (canCancel) {
      status = TimelockStatus.EXPIRED;
      timeRemaining = 0;
    } else {
      // Cas edge qui ne devrait pas arriver en théorie
      status = TimelockStatus.EXPIRED;
      timeRemaining = 0;
    }

    return {
      status,
      canExecute,
      canCancel,
      timeRemaining
    };
  }

  /**
   * Crée des paramètres de timelock optimisés pour les atomic swaps cross-chain
   * 
   * Cette méthode calcule automatiquement des délais appropriés selon le type
   * de swap et les caractéristiques des blockchains impliquées.
   */
  static createOptimalTimelock(
    swapDuration: number = 3600,  // 1 heure par défaut
    safetyMargin: number = 1800   // 30 minutes de marge de sécurité
  ): TimelockParams {
    const now = Math.floor(Date.now() / 1000);
    
    // Calcul des timestamps avec des marges de sécurité appropriées
    const finishAfter = now + 300;  // 5 minutes pour finaliser la préparation
    const cancelAfter = now + swapDuration + safetyMargin;

    // Validation de la cohérence temporelle
    if (cancelAfter <= finishAfter) {
      throw new Error('Configuration de timelock incohérente: cancelAfter doit être après finishAfter');
    }

    const timelock: TimelockParams = {
      finishAfter,
      cancelAfter,
      currentTime: now
    };

    console.log(`🕐 Timelock créé: exécutable dans ${finishAfter - now}s, expire dans ${cancelAfter - now}s`);
    
    return timelock;
  }

  /**
   * Convertit un hashlock en format compatible avec XRP Ledger
   * 
   * Cette méthode adapte nos hashlocks pour être utilisés dans les
   * transactions XRP qui ont des exigences de format spécifiques.
   */
  static formatForXRPL(hashlockData: HashlockData): {
    condition: string;    // Hash formaté pour XRPL
    fulfillment: string;  // Secret formaté pour XRPL
  } {
    // XRP Ledger utilise un format hexadécimal spécifique pour les conditions
    const condition = hashlockData.hash.toUpperCase();
    
    // Le fulfillment est le secret encodé en hexadécimal
    const fulfillment = Buffer.from(hashlockData.secret, 'utf8').toString('hex').toUpperCase();

    return {
      condition,
      fulfillment
    };
  }

  /**
   * Utilitaire pour afficher des informations de debug sur un hashlock
   * 
   * Cette méthode facilite le debugging en fournissant un aperçu complet
   * des propriétés d'un hashlock sans exposer le secret complet.
   */
  static debugHashlock(hashlockData: HashlockData): void {
    console.log('🔍 Debug Hashlock:');
    console.log(`  Hash: ${hashlockData.hash}`);
    console.log(`  Secret (tronqué): ${hashlockData.secret.substring(0, 8)}...`);
    console.log(`  Algorithme: ${hashlockData.algorithm}`);
    console.log(`  Créé: ${new Date(hashlockData.createdAt).toLocaleString()}`);
    if (hashlockData.expiresAt) {
      console.log(`  Expire: ${new Date(hashlockData.expiresAt).toLocaleString()}`);
    }
  }
}

// Export des types et de la classe principale
export default HashlockManager;