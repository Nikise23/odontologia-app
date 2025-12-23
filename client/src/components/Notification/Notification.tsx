import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const NotificationContainer = styled.div<{ $type: string }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => 
    props.$type === 'success' ? '#4CAF50' :
    props.$type === 'error' ? '#f44336' :
    '#2196F3'
  };
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const Icon = styled.div`
  font-size: 20px;
  display: flex;
  align-items: center;
`;

const Message = styled.div`
  flex: 1;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationCircle />;
      default:
        return <FaExclamationCircle />;
    }
  };

  return (
    <NotificationContainer $type={type}>
      <Icon>{getIcon()}</Icon>
      <Message>{message}</Message>
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
    </NotificationContainer>
  );
};

export default Notification;
