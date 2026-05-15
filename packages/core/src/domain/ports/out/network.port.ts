import { Subscriber, UESession, NetworkMetrics, AttachOptions } from '../../models/network.types';

export interface UniversalNetworkPort {
  /**
   * Provision a subscriber in the core network database (HSS/UDM).
   */
  provision(subscriber: Subscriber): Promise<void>;

  /**
   * Remove a subscriber from the core network database.
   */
  deprovision(imsi: string): Promise<void>;

  /**
   * Start a UE simulation and attach it to the network.
   * Resolves when the PDU session is successfully established.
   */
  attachUE(imsi: string, options?: AttachOptions): Promise<UESession>;

  /**
   * Terminate a UE simulation and detach it from the network.
   */
  detachUE(imsi: string): Promise<void>;

  /**
   * Get live metrics for a specific UE session.
   */
  getMetrics(imsi: string): Promise<NetworkMetrics>;

  /**
   * Get all active UE sessions.
   */
  getSessions(): Promise<UESession[]>;
}
