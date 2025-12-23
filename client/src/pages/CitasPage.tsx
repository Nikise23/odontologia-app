import React from 'react';
import styled from 'styled-components';
import CitasDelDia from '../components/Citas/CitasDelDia';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

const CitasPage: React.FC = () => {
  return (
    <Container>
      <CitasDelDia />
    </Container>
  );
};

export default CitasPage;
