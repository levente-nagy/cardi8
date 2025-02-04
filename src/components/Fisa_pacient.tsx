import React, { useEffect, useState } from 'react';
import { Typography, Descriptions, Avatar, Button, ConfigProvider } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { db,  auth  } from './Firebase'
import { doc, getDoc, DocumentReference, DocumentData, getDocs, where, query, collection, onSnapshot  } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, XAxis } from 'recharts';


const { Title } = Typography;

const UserProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [medicName, setMedicName] = useState<string | null>(null);
  const [ultimeleRecomandari, setUltimeleRecomandari] = useState<any[]>([]);
  const [ultimeleMasuratori, setUltimeleMasuratori] = useState<any[]>([]);
  const [ultimeleAlarme, setUltimeleAlarme] = useState<any[]>([]);
  const [ecgData, setECGData] = useState<any[]>([]);
  const formattedECGData = ecgData.map((value, index) => ({ value, time: index }));
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        console.log('No user logged in');
      }
    });

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

  const fetchUltimeleMasuratori = (patientId: string) => {
    const patientDocRef = doc(db, 'pacienti', patientId);
  
    onSnapshot(patientDocRef, (snapshot) => {
      const patientData = snapshot.data();
      if (patientData && patientData.masuratori) {
        const masuratoriArray = Object.values(patientData.masuratori);
        const ultimeleMasuratori = masuratoriArray.slice(-5); 
        setUltimeleMasuratori(ultimeleMasuratori);
      } else {
        setUltimeleMasuratori([]);
      }
    }, (error) => {
      console.error('Error fetching masuratori:', error);
      setUltimeleMasuratori([]);
    });
  };

  const fetchUltimeleAlarme = (patientId: string) => {
    const patientDocRef = doc(db, 'pacienti', patientId);
  
    onSnapshot(patientDocRef, (snapshot) => {
      const patientData = snapshot.data();
      if (patientData && patientData.alarme) {
        const alarmeArray = Object.values(patientData.alarme);
        const ultimeleAlarme = alarmeArray.slice(-5); 
        setUltimeleAlarme(ultimeleAlarme);
      } else {
        setUltimeleAlarme([]);
      }
    }, (error) => {
      console.error('Error fetching alarme:', error);
      setUltimeleAlarme([]);
    });
  };

  const fetchECGData = (patientId: string) => {
    const patientDocRef = doc(db, 'pacienti', patientId);
  
    onSnapshot(patientDocRef, (snapshot) => {
      const patientData = snapshot.data();
      if (patientData && patientData.ecg && patientData.ecg.data) {
        const ecgDataArray = patientData.ecg.data;
        setECGData(ecgDataArray);
      } else {
        setECGData([]);
      }
    }, (error) => {
      console.error('Error fetching ECG data:', error);
      setECGData([]);
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
        fetchUltimeleMasuratori(userId);
        fetchUltimeleAlarme(userId);
        fetchECGData(userId);
  
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

  const formatLegend = (value: any) => {
    switch (value) {
      case 'puls':
        return 'Puls';
      case 'temp':
        return 'Temperatură';
      case 'umid':
        return 'Umiditate';
      default:
        return value;
    }
  };

  const formatTooltip = (value: any, name: any) => {
    switch (name) {
      case 'puls':
        return [`${value} bpm`, 'Puls'];
      case 'temp':
        return [`${value} °C`, 'Temperatură'];
      case 'umid':
        return [`${value} %`, 'Umiditate'];
      default:
        return [value, name];
    }
  };

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
          <Button shape="round" type="primary" htmlType="submit" className='to_hide' onClick={() => navigate('/home')}>
          Deconectare
          </Button>
          </div>
      <div className='header_fisa'>
        <img src="/banner_brand.png" className='banner_brand' alt="Brand Banner" />
        <div className='fisa_pacient '>
          <Avatar size={64} icon={<UserOutlined />} className='avatar' />
          <Title level={4}>Profil medical - {userData.nume_prenume}<br/></Title>
          
        </div>
        
      </div>
      
      <div className='fisa'>
    <div className='print_button'>
      <Button shape="round" type="primary" htmlType="submit" onClick={() => { window.print(); }} className='to_hide'>
        Tipărire
      </Button>
      <br/>
      
         </div>
        <div className='delimiter'>
        <Title level={4}>Date personale</Title>
        <Descriptions bordered size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Nume" labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.nume_prenume}</Descriptions.Item>
  <Descriptions.Item label="Vârstă" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.varsta}</Descriptions.Item>
  <Descriptions.Item label="CNP" labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.CNP}</Descriptions.Item>
  <Descriptions.Item label="Adresă" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.adresa}</Descriptions.Item>
  <Descriptions.Item label="Contact" labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>Telefon: {userData.telefon}, Email: {userData.email}</Descriptions.Item>
  <Descriptions.Item label="Profesie" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.profesie}</Descriptions.Item>
</Descriptions>
</div>
<div className='delimiter'>
        <Title level={4}>Detalii medicale</Title>
        <Descriptions bordered size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Medic" labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{medicName}</Descriptions.Item>
  <Descriptions.Item label="Istoric Medical" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.istoric}</Descriptions.Item>
  <Descriptions.Item label="Alergii" labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.alergii}</Descriptions.Item>
  <Descriptions.Item label="Consultaţii Cardiologice" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{userData.consultatii}</Descriptions.Item>
</Descriptions>
</div>
<div className='delimiter'>
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
<div className='delimiter'>
              <Title level={4}>Măsurători</Title>
              {ultimeleMasuratori.length === 0 ? (
                <Title level={5}>Nu există măsurători anterioare.</Title>
              ) : (
                <>
                <br/>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={ultimeleMasuratori}>
                      <CartesianGrid strokeDasharray="3 3" />
                      
                      <YAxis />
                      <Tooltip formatter={formatTooltip} labelFormatter={() => ""}/>
                      <Legend formatter={formatLegend}  />
                      <Line type="monotone" dataKey="puls" stroke="#8884d8" />
                      <Line type="monotone" dataKey="temp" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="umid" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                  <br/>
                  {ultimeleMasuratori.map((masuratori, index) => (
                    <Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }}>
                      <Descriptions.Item label="Puls" labelStyle={{ width: '20%' }} contentStyle={{ width: '20%' }}>{masuratori.puls}</Descriptions.Item>
                      <Descriptions.Item label="Temperatură" span={2} labelStyle={{ width: '20%' }} contentStyle={{ width: '20%' }}>{masuratori.temp}</Descriptions.Item>
                      <Descriptions.Item label="Umiditate" labelStyle={{ width: '20%' }} contentStyle={{ width: '20%' }}>{masuratori.umid}</Descriptions.Item>
                      <Descriptions.Item label="Data și ora" span={2} labelStyle={{ width: '20%' }} contentStyle={{ width: '20%' }}>{masuratori.time_stamp}</Descriptions.Item>
                    </Descriptions>
                  ))}
                </>
              )}
            </div>


<div className='delimiter'>
        <Title level={4}>Alarme</Title>


        
  {ultimeleAlarme.length === 0 ?  (
    <Title level={5}>Nu există alarme anterioare.</Title>
  ) : ( 
    ultimeleAlarme.map((alarme, index) => (
      
     
<Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Tip"  labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.tip}</Descriptions.Item>
  <Descriptions.Item label="Stare" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.stare}</Descriptions.Item>
  <Descriptions.Item label="Descriere"  span={3} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.descriere}</Descriptions.Item>
  <Descriptions.Item label="Comentariu" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.comentariu}</Descriptions.Item> 
  <Descriptions.Item label="Data și ora" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.time_stamp}</Descriptions.Item>    
</Descriptions>


    ))
  )}
</div>

<div className='delimiter'>  

<Title level={4}>ECG</Title>

       {formattedECGData.length === 0 ?  (
    <Title level={5}>Nu există valori ECG anterioare.</Title>
  ) : (      
       <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedECGData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'Voltage (mV)', angle: -90, position: 'insideLeft' }} domain={[650, 700]}/>
       
        <Line type="monotone" dataKey="value" stroke="#d80242" dot={false} />
      </LineChart>
    </ResponsiveContainer>
      )}
       </div>  


      </div>
      
    </div>
    </ConfigProvider>
  );
};

export default UserProfilePage;
