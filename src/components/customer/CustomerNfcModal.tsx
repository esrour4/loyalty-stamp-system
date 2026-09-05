import React, { useState } from 'react';
import { Customer } from '../../types';
import { NfcTagWriterModal } from '../common/NfcTagWriterModal';

interface CustomerNfcModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onOpenQrScanner?: () => void;
}

export const CustomerNfcModal: React.FC<CustomerNfcModalProps> = ({
  isOpen,
  onClose,
  customer,
  onOpenQrScanner,
}) => {
  return (
    <NfcTagWriterModal
      isOpen={isOpen}
      onClose={onClose}
      customer={customer}
      onOpenQrScanner={onOpenQrScanner}
    />
  );
};
