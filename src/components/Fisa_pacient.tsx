import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Avatar, Button, ConfigProvider, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { db,  auth  } from './Firebase'
import { doc, getDoc, DocumentReference, DocumentData, getDocs, where, query, collection, onSnapshot  } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


const { Title } = Typography;

const UserProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [medicName, setMedicName] = useState<string | null>(null);
  const [ultimeleRecomandari, setUltimeleRecomandari] = useState<any[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        console.log('No user logged in');
      }
    });
  
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
    
  const fetchUltimeleRecomandari = (userId: string) => {
    const patientDocRef = doc(db, 'pacienti', userId);
  
    onSnapshot(patientDocRef, (snapshot) => {
      const patientData = snapshot.data();
      if (patientData && patientData.recomandari) {
        const recommendationsArray = Object.values(patientData.recomandari);
        const ultimeleRecomandari = recommendationsArray.slice(-5); 
        setUltimeleRecomandari(ultimeleRecomandari);
      } else {
        setUltimeleRecomandari([]);
      }
    }, (error) => {
      console.error('Error fetching recommendations:', error);
      setUltimeleRecomandari([]);
    });
  };
  
  const fetchUserData = async (userId: string) => {
    try {
      const userRef: DocumentReference<DocumentData> = doc(db, "pacienti", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserData(userData);
        fetchUltimeleRecomandari(userId);
  
        if (userData.medic_id) {
          const medicName = await fetchMedicName(userData.medic_id);
          setMedicName(medicName);
        }
      } else {
        console.log('No such document for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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



 

  const demographicItems = [

    {
      
      label: 'Nume',
      children: userData.nume_prenume,
      
    },
    {
 
      label: 'Vârstă',
      children: userData.varsta,
      span: 2,
    },
    {
     
      label: 'CNP',
      children: userData.CNP,
      
    },
    {
     
      label: 'Adresă',
      children: userData.adresa,
      span: 2,
      
    },
    {
     
      label: 'Contact',
      children: `Telefon: ${userData.telefon}, Email: ${userData.email}`,
      
    },
    {
     
      label: 'Profesie',
      children: userData.profesie,
      span: 2,
    },
  ];

  const medicalItems = [
    {
      
      label: 'Medic',
      children: medicName,
      
    },
    {
      
      label: 'Istoric Medical',
      children: userData.istoric,
      span: 2,
    },
    {
      
      label: 'Alergii',
      children: userData.alergii,
      
    },
    {
      
      label: 'Consultaţii Cardiologice',
      children: userData.consultatii,
      span: 2,
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
          <Title level={3}>Profil medical<br/></Title>
        </div>
      </div>
      <div className='fisa'>
        <Space direction="vertical" size={10} >
         
    
        <Title level={4}>Date personale</Title>
        <Descriptions bordered>
          {demographicItems.map(item => (
            <Descriptions.Item labelStyle={{width: '20%'}} contentStyle={{width: '20%'}} label={item.label} span={item.span}>{item.children}</Descriptions.Item>
          ))}
        </Descriptions>
        <Title level={4}>Detalii medicale</Title>
        <Descriptions bordered>
          {medicalItems.map(item => (
            <Descriptions.Item  labelStyle={{width: '20%'}} contentStyle={{width: '20%'}} label={item.label} span={item.span}>{item.children}</Descriptions.Item>
          ))}
        </Descriptions>

        <div>
        <Title level={4}>Recomandări</Title>

  {ultimeleRecomandari.length === 0 ?  (
    <Title level={5}>Nu există recomandări anterioare.</Title>
  ) : ( 
    ultimeleRecomandari.map((recommendation, index) => (
      
     
<Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Titlu"  labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{recommendation.titlu}</Descriptions.Item>
  <Descriptions.Item label="Descriere" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{recommendation.descriere}</Descriptions.Item>
  <Descriptions.Item label="Observații"  labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{recommendation.observatii}</Descriptions.Item>
  <Descriptions.Item label="Data și ora" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{recommendation.time_stamp}</Descriptions.Item>    
</Descriptions>


    ))
  )}
</div>


        </Space>
      </div>
      
    </div>
    </ConfigProvider>
  );
};

export default UserProfilePage;
