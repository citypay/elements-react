import {PaymentIntentSession, VerifyAuthResponse} from '@citypay/elements-react';
import { AUTHORISE_PATH, BACKEND_URL, PATH_PING, SESSION_PATH, VERIFY_AUTH_PATH } from './config';

/**
 * A collection of small helper methods to call your secure server.
 * Default URL values are set for the demo-server package in this repository.
 * Custom URLs can be set in the associated config.ts file
 */
export class ServerConnection {

  /**
   * Verify the secure server is available
   */
  static async checkServerConnection(): Promise<void> {
    const response = await fetch(BACKEND_URL + PATH_PING, {
      method: 'GET',
    });

    if (response.ok) {
      console.info('[cp-demo] Checked server connection');
      return
    } else {
      throw new Error(`[cp-demo] Connection to server at '${BACKEND_URL}' failed`);
    }
  }

  /**
   * Request a Payment Intent Session from the server.
   * Configuration values for the intent are specified in the server
   */
  static async getPaymentSession(): Promise<PaymentIntentSession> {
    const response = await fetch(BACKEND_URL + SESSION_PATH, {
      method: 'GET',
    });

    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Unable to get payment session');
    }
  }

  /**
   * Request the server authorise a payment for a Payment Intent
   */
  static async authorise(intentId: string): Promise<any> {
    const response = await fetch(BACKEND_URL + AUTHORISE_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intentId }),
    });

    if (!response.ok) {
      throw new Error('Unable to authorise payment intent');
    }

    return response.json()
  }

  /**
   * Request the server verify the authorisation of a Payment Intent
   */
  static async verifyAuth(intentId: string): Promise<VerifyAuthResponse> {
    const response = await fetch(BACKEND_URL + VERIFY_AUTH_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ intentId }),
    });

    if (response.ok) {
      return response.json();
    }

    throw new Error('Unable to verify authorised payment intent');
  }
}
