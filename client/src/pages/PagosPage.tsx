import React from 'react';
import styled from 'styled-components';
import PagosPage from '../components/Pagos/PagosPage';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PagosPageWrapper: React.FC = () => {
  return (
    <Container>
      <PagosPage />
    </Container>
  );
};

export default PagosPageWrapper;