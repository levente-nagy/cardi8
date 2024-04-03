import React from 'react';
import { Descriptions, Typography, Avatar } from 'antd';
import type { DescriptionsProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const demographicItems: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'ID Pacient',
    children: '212451',
    span: 3,
  },
  {
    key: '2',
    label: 'Nume',
    children: 'Popescu Ana',
    
  },

  {
    key: '3',
    label: 'Vârstă',
    children: '35',
    
  },
  {
    key: '4',
    label: 'CNP',
    children: '1234567890123',
  },
  {
    key: '5',
    label: 'Adresă',
    children: 'Str. Florilor, nr. 10, București',

  },
  {
    key: '6',
    label: 'Contact',
    children: 'Telefon: 0721123456, Email: ana.popescu@example.com ',
    span: 3,
  },

  {
    key: '7',
    label: 'Profesie',
    children: 'Profesor, Colegiul Național "Ion Creangă ',
  },

];

const medicalItems: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'Medic',
    children: 'Ionescu Gheorge',
    span: 3,
  },
  {
    key: '2',
    label: 'Istoric Medical',
    children: 'Pacientul a suferit anterior de hipertensiune arterială.',
    span: 3,
  },
  {
    key: '3',
    label: 'Alergii',
    children: 'Niciuna',
    span: 3,
  },
  {
    key: '4',
    label: 'Consultaţii Cardiologice',
    children: 'Ultima consultație a fost în data de 15 martie 2024. Nu sunt probleme semnificative identificate.',
    span: 3,
  },
  {
    key: '5',
    label: 'Recomandări',
    children: (
      <>
        <ul>
          <li>Tipul: Alergat</li>
          <li>Durata zilnică: 30 minute</li>
          <li>Alte Indicaţii: Evitați efortul intens în timpul zilelor caniculare.</li>
        </ul>
      </>
    ),
    span: 3,
  },
];

const UserProfilePage: React.FC = () => (
 <div>


<div className='header_fisa'>
  <img src="/banner_brand.png" className='banner_brand' />
  <div className='fisa_pacient'>
    <Avatar size={64} icon={<UserOutlined />} className='avatar' />
    <Title level={3}>Profil Medical</Title>
  </div>
</div>
  <div className='fisa'>
    
    
    <Title level={4}>Date personale</Title>
    <Descriptions bordered items={demographicItems} />

    <Title level={4}>Detalii medicale</Title>
    <Descriptions bordered items={medicalItems} />
  </div>
  </div>
);

export default UserProfilePage;
