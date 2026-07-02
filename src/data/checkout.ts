export interface CustomerInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

export const validCustomer: CustomerInfo = {
  firstName: 'Omar',
  lastName: 'Contreras',
  postalCode: '28080',
};

export const checkoutErrors = {
  missingFirstName: 'Error: First Name is required',
  missingLastName: 'Error: Last Name is required',
  missingPostalCode: 'Error: Postal Code is required',
} as const;
