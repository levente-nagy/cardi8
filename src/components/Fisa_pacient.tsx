import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Avatar, Button, ConfigProvider, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { db,  auth  } from './Firebase'
import { doc, getDoc, DocumentReference, DocumentData, getDocs, where, query, collection  } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


const { Title } = Typography;

const UserProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [medicName, setMedicName] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const userRef: DocumentReference<DocumentData> = doc(db, "pacienti", userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);

            if (userData.medic_id) {
              const medicName = await fetchMedicName(userData.medic_id);
              setMedicName(medicName);
            }
          } else {
            console.log('No such document for user:', userId);
          }
        } else {
          console.log('No user logged in');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const fetchMedicName = async (medicId: string) => {
    try {
      const pacientiRef = collection(db, 'pacienti');
      const pacientiQuery = query(pacientiRef, where('medic_id', '==', medicId));
      const pacientiSnapshot = await getDocs(pacientiQuery);
      if (!pacientiSnapshot.empty) {
        const pacientiDoc = pacientiSnapshot.docs[0];
        const medicData = pacientiDoc.data();
        return fetchMedicNameFromMedici(medicData.medic_id);
      } else {
        console.log('No medic found for id:', medicId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching medic name:', error);
      return null;
    }
  };

  const fetchMedicNameFromMedici = async (medicId: string) => {
    try {
      const medicRef = doc(db, 'medici', medicId);
      const medicDoc = await getDoc(medicRef);
      if (medicDoc.exists()) {
        const medicData = medicDoc.data();
        return medicData.nume;
      } else {
        console.log('No medic found for id:', medicId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching medic name from medici:', error);
      return null;
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const userId = auth.currentUser?.uid;

  const demographicItems = [
    {
      key: '1',
      label: 'ID Pacient',
      children: userId,
      span: 3,
    },
    {
      key: '2',
      label: 'Nume',
      children: userData.nume_prenume,
    },
    {
      key: '3',
      label: 'Vârstă',
      children: userData.varsta,
    },
    {
      key: '4',
      label: 'CNP',
      children: userData.CNP,
    },
    {
      key: '5',
      label: 'Adresă',
      children: userData.adresa,
    },
    {
      key: '6',
      label: 'Contact',
      children: `Telefon: ${userData.telefon}, Email: ${userData.email}`,
      span: 3,
    },
    {
      key: '7',
      label: 'Profesie',
      children: userData.profesie,
    },
  ];

  const medicalItems = [
    {
      key: '1',
      label: 'Medic',
      children: medicName,
      span: 3,
    },
    {
      key: '2',
      label: 'Istoric Medical',
      children: userData.istoric,
      span: 3,
    },
    {
      key: '3',
      label: 'Alergii',
      children: userData.alergii,
      span: 3,
    },
    {
      key: '4',
      label: 'Consultaţii Cardiologice',
      children: userData.consultatii,
      span: 3,
    },
    {
      key: '5',
      label: 'Recomandări',
      children: (
        <ul>
          <li>Tipul: Alergat</li>
          <li>Durata zilnică: 30 minute</li>
          <li>Alte Indicaţii: Evitați efortul intens în timpul zilelor caniculare.</li>
        </ul>
      ),
      span: 3,
    },
  ];

  return (
    <ConfigProvider
    theme={{
      token: {
        colorPrimary: "#d80242",
        colorInfo: "#d80242"
        
      },
    }}
  >
    <div>
      <div className='back_button'>
          <Button shape="round" type="primary" htmlType="submit" onClick={() => navigate('/home')}>
          Deconectare
          </Button>
          </div>
      <div className='header_fisa'>
        <img src="/banner_brand.png" className='banner_brand' alt="Brand Banner" />
        <div className='fisa_pacient'>
          <Avatar size={64} icon={<UserOutlined />} className='avatar' />
          <Title level={3}>Profil Medical<br/></Title>
        </div>
      </div>
      <div className='fisa'>
        <Space direction="vertical" size={10} >
         
    
        <Title level={4}>Date personale</Title>
        <Descriptions bordered>
          {demographicItems.map(item => (
            <Descriptions.Item key={item.key} label={item.label} span={item.span}>{item.children}</Descriptions.Item>
          ))}
        </Descriptions>
        <Title level={4}>Detalii medicale</Title>
        <Descriptions bordered>
          {medicalItems.map(item => (
            <Descriptions.Item key={item.key} label={item.label} span={item.span}>{item.children}</Descriptions.Item>
          ))}
        </Descriptions>
        </Space>
      </div>
    </div>
    </ConfigProvider>
  );
};

export default UserProfilePage;
