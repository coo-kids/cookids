export interface CheckoutDetails {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  deliveryLocation: string;
  targetDeliveryDate?: string;
  deliveryComment?: string;
}
