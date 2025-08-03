import React, { useState } from 'react';
import TokenModal from '../TokenModal';
import type { User } from '../../types/github';

interface TokenModalWrapperProps {
  token: string;
  user: User | null;
}

const TokenModalWrapper: React.FC<TokenModalWrapperProps> = ({ token }) => {
  const [showTokenModal, setShowTokenModal] = useState(false);

  React.useEffect(() => {
    if (!token) {
      setShowTokenModal(true);
    }
  }, [token]);

  if (!token) {
    return <TokenModal isOpen={showTokenModal} onClose={() => setShowTokenModal(false)} />;
  }

  return null;
};

export default TokenModalWrapper;
