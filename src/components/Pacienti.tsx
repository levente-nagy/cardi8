import  { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, setDoc, arrayUnion, arrayRemove, getDoc, onSnapshot } from 'firebase/firestore';
import { db,  createUser, auth  } from './Firebase'
import { Table, Button, Space, Modal, ConfigProvider, Switch, Form, Input, InputNumber, Popconfirm, Descriptions, DescriptionsProps, Badge, Flex, Row, Col } from 'antd';
import { EditFilled, DeleteFilled, EyeFilled, UnorderedListOutlined, BellFilled} from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import { Item } from '../types';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';




const Pacienti: React.FC = () => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAlarmeVisible, setAlarmeVisible] = useState(false);
  const [isRecomandariVisible, setRecomandariVisible] = useState(false);
  const [isAdaugaRecomandariVisible, setAdaugaRecomandariVisible] = useState(false);
  const [isViewVisible, setIsViewVisible] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dataSource, setDataSource] = useState<Item[]>([]);
  const [formDatePacient] = Form.useForm();
  const [formRecomandari] = Form.useForm();
  const [formAlarme] = Form.useForm();
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Item | null>(null);
  const [ultimeleRecomandari, setUltimeleRecomandari] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const columns = [
    
    { title: 'Nume', dataIndex: 'nume_prenume', render: (_text: string, record: Item) => (
      <span>{record.nume_prenume}</span>
    )},
    { title: 'Vârstă', dataIndex: 'varsta' },

    { title: 'Profesie', dataIndex: 'profesie', render: (_text: string, record: Item) => (
      <span>{record.profesie}</span>
    )},

    { title: 'Contact', dataIndex: 'contact', render: (_text: string, record: Item) => (
      <span>Telefon:<br/>{record.telefon}<br/>Email:<br/> {record.email}</span>
    )},
    { title: 'Detalii medicale', dataIndex: 'detalii_medicale', render: (_text: string, record: Item) => (
      <span><b>Istoric medical</b>:<br/> {record.istoric}<br/><b>Alergii</b>:<br/> {record.alergii}<br/><b>Consultații cardiologice</b>:<br/> {record.consultatii}</span>
    )},

    {
      title: 'Recomandări',
      key: 'recomandari',
      width: 80,
     
      render: (record: Item) => (
        <Flex gap="small" vertical justify="center" align='center'>
       <Button shape="round" className="view_button" style={{ verticalAlign: "baseline" }} onClick={() =>{ showRecomandari(); handleSelectPatient(record); }}>
          <UnorderedListOutlined /> 
        </Button>
        </Flex>
       
          
      ),
    },

    {
      title: 'Alarme',
      key: 'modul_inteligent',
      width: 80,
      
      render: (record: Item) => (
        <Flex gap="small" vertical justify="center" align='center'>
        <Badge count={5}>
        <Button shape="round" className="view_button" onClick={() =>{ showAlarme(record);}}>
        <BellFilled />
        </Button>
        </Badge>
        </Flex>
      ),
    },
    {
      title: 'Gestionare pacient',
      key: 'actions',
      width: 80,
      
      render: (record: Item) => (
       <Flex gap="small" vertical justify="center" align='center'>
        <Space direction="vertical">
        <Button shape="round" className="view_button" onClick={() =>{setSelectedPatient(record);
              setIsViewVisible(true);}}>
          <EyeFilled />
        </Button>
          <Button shape="round" onClick={() =>{ showModal(record);  setEditing(record);}} className='action_button' ><EditFilled /></Button>
          <Popconfirm title="Sunteţi sigur că vreţi să ştergeţi acest pacient?" onConfirm={() => handleDelete(record.id)} okText="Da" cancelText="Nu">
            <Button shape="round"  className='action_button' ><DeleteFilled /></Button>
            </Popconfirm>
        </Space>
       </Flex>
      ),
    },
 
  ];

  const ValorileActualeModul: DescriptionsProps['items'] = [

    {
      key: '1',
      label: 'Puls',
      children: 'N/A',
      span: 3,
    },
    {
      key: '2',
      label: 'Temperatură',
      children: 'N/A',
      span: 3,
    },
    {
      key: '3',
      label: 'Umiditate',
      children: 'N/A',
      span: 3,
    },
  ];

  const items: DescriptionsProps['items'] = [
    {
      
      label: 'Nume',
      children: <p>{selectedPatient?.nume_prenume}</p>,
      span: 3,
    },
    {
      
      label: 'Vârstă',
      children: <p>{selectedPatient?.varsta}</p>,
      span: 3,
    },
    {
      
      label: 'CNP',
      children: <p>{selectedPatient?.CNP}</p>,
      span: 3,
    },
    {
  
      label: 'Adresă',
      children: (
        <p>
          {selectedPatient?.adresa}
          
        </p>
      ),
      span: 3,
    },
    {
     
      label: 'Contact',
      children: (
        <p>
          Telefon: {selectedPatient?.telefon}
          <br />
          Email: {selectedPatient?.email}
        </p>
      ),
      span: 3,
    },
    {
   
      label: 'Profesie',
      children: <p>{selectedPatient?.profesie}</p>,
      span: 3,
    },
    
    
    {
     
      label: 'Detalii medicale',
      children: (
        <p>
          Istoric medical: {selectedPatient?.istoric}
          <br />
          Alergii: {selectedPatient?.alergii}
          <br />
          Consultații cardiologice: {selectedPatient?.consultatii}
        </p>
      ),
      span: 3,
    },
  ];

  



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const medic_id = user.uid;
        console.log('medic_id:', medic_id); // Check the value of medic_id
        setLoggedInUserId(medic_id);
        const getPatients = async () => {
          try {
            const medicDocRef = doc(db, "medici", medic_id);
            const unsubscribeSnapshot = onSnapshot(medicDocRef, async (docSnapshot) => {
              console.log('docSnapshot.exists():', docSnapshot.exists()); // Check if the medic document exists
              if (docSnapshot.exists()) {
                const pacientiArray = docSnapshot.data().pacienti || [];
                console.log('pacientiArray:', pacientiArray); // Check the value of pacientiArray
                const patientsPromises = pacientiArray.map(async (patientId: string) => {
                  const patientDocSnapshot = await getDoc(doc(db, "pacienti", patientId));
                  return { ...patientDocSnapshot.data(), id: patientDocSnapshot.id } as Item;
                });
                const patients = await Promise.all(patientsPromises);
                console.log('patients:', patients); // Check the value of patients
                setDataSource(patients);
              } else {
                setDataSource([]);
              }
            });
            return () => unsubscribeSnapshot();
          } catch (error) {
            console.error("Error fetching patients:", error);
          }
        };
        getPatients();
      }
    });
  
    // Clean up the listener when the component is unmounted
    return () => unsubscribe();
  }, []);


  const showModal = (record: Item | null) => {
    if (record) {
      const [nume, prenume] = record.nume_prenume.split(' ');
 
      const [profesie, locDeMunca] = record.profesie.split(', ');
  
      let adresaParts = record.adresa ? record.adresa.split(', ') : [];

      let strada = adresaParts[0] || '';
      let numar = adresaParts[1] && adresaParts[1].includes('Nr. ') ? adresaParts[1].replace('Nr. ', '') : '';

      let bloc = adresaParts.find(part => part.includes('Bl. ')) ? adresaParts.find(part => part.includes('Bl. '))!.replace('Bl. ', '') : '';
      let etaj = adresaParts.find(part => part.includes('Et. ')) ? adresaParts.find(part => part.includes('Et. '))!.replace('Et. ', '') : '';
      let apartament = adresaParts.find(part => part.includes('Ap. ')) ? adresaParts.find(part => part.includes('Ap. '))!.replace('Ap. ', '') : '';
      
      let codPostal = adresaParts.find(part => part.includes('Cod poștal: ')) ? adresaParts.find(part => part.includes('Cod poștal: '))!.replace('Cod poștal: ', '') : '';
      let oras = adresaParts.find(part => part.includes('Loc. ')) ? adresaParts.find(part => part.includes('Loc. '))!.replace('Loc. ', '') : '';
      let judet = adresaParts.find(part => part.includes('Jud. ')) ? adresaParts.find(part => part.includes('Jud. '))!.replace('Jud. ', '') : '';
      
      const initialValues = {
        nume,
        prenume,
        varsta: record.varsta,
        CNP: record.CNP,
        strada,
        numar,
        bloc,
        etaj,
        apartament,
        codPostal,
        oras,
        judet,
        telefon: record.telefon,
        email: record.email,
        profesie,
        locDeMunca,
        istoric: record.istoric,
        alergii: record.alergii,
        consultatii: record.consultatii
      };
      formDatePacient.setFieldsValue(initialValues);
    } else {
      formDatePacient.resetFields();
    }
    setIsModalVisible(true);
  };




  const addPatient = async (patientData: Item) => {
    try {
      const medic_id = loggedInUserId;
      const userCredential = await createUser(patientData.email, '123456');
  
      if (userCredential) {
        const patientUid = userCredential.user.uid;
  
        await setDoc(doc(db, "pacienti", patientUid), {
          ...patientData,
          medic_id: medic_id 
        });
  
        console.log('Patient added:', patientData);
  
        if (medic_id) { 
          const medicDocRef = doc(db, "medici", medic_id);
          await updateDoc(medicDocRef, {
            pacienti: arrayUnion(patientUid)
          });
        } else {
          console.error('No user logged in.');
        }
  
        if (medic_id && patientData.medic_id === medic_id) {
          setDataSource(prevDataSource => {
            const newDataSource = [...prevDataSource, { ...patientData, id: patientUid }];
              return newDataSource.filter(patient => patient.medic_id === medic_id);
          });
        }
        
      } else {
        console.error('No user created.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };



  const handleOk = async () => {
    formDatePacient.validateFields().then(async (values) => {
      console.log("Submitted values:", values);

      const processedValues: Partial<Item> = { ...values };

      const numePrenume = `${values.nume} ${values.prenume}`;
      processedValues.nume_prenume = numePrenume;
      delete processedValues.nume;
      delete processedValues.prenume;
      
      const profesie = `${values.profesie}, ${values.locDeMunca}`;
      processedValues.profesie = profesie;
      delete processedValues.locDeMunca;
  
      let adresa = `${values.strada}, Nr. ${values.numar}`;
      if (values.bloc) {
        adresa += `, Bl. ${values.bloc}`;
      }
      if (values.etaj) {
        adresa += `, Et. ${values.etaj}`;
      }
      if (values.apartament) {
        adresa += `, Ap. ${values.apartament}`;
      }

      adresa += `, Cod poștal: ${values.codPostal}, Loc. ${values.oras}, Jud. ${values.judet}`;
      processedValues.adresa = adresa;
      delete processedValues.strada;
      delete processedValues.numar;
      delete processedValues.bloc;
      delete processedValues.etaj;
      delete processedValues.apartament;
      delete processedValues.codPostal;
      delete processedValues.oras;
      delete processedValues.judet;
  
      if (editing) {
        await updateDoc(doc(db, "pacienti", editing.id), processedValues);
      } else {
        await addPatient(processedValues as Item); 
      }
  
      setIsModalVisible(false);
      setEditing(null);
      formDatePacient.resetFields();
  
      const data = await getDocs(collection(db, "pacienti"));
      const filteredData = data.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }) as Item)
        .filter((patient) => patient.medic_id === loggedInUserId);
  
      setDataSource(filteredData);
    });
  };


  const handleSelectPatient = (patient: Item) => {
    fetchUltimeleRecomandari(patient.id);
    setSelectedPatient(patient);
  };

  const fetchUltimeleRecomandari = (patientId: string) => {
    const patientDocRef = doc(db, 'pacienti', patientId);
  
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


  const handleSalveazaRecomandari = async () => {
    formRecomandari.validateFields().then(async (values) => {

      if (!selectedPatient) {
        console.error("No patient selected.");
        return;
      }
  
      try {
        const now = new Date();
        const time_stamp = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const patientDocRef = doc(db, "pacienti", selectedPatient.id);
        const patientSnapshot = await getDoc(patientDocRef);
        const patientData = patientSnapshot.data();
        const existingRecomandari = patientData?.recomandari || {};

        const nextKey = Object.keys(existingRecomandari).length;
        const updatedValues = {
          recomandari: {
            ...existingRecomandari,
            [nextKey]: {
              titlu: values.titlu || "",
              descriere: values.descriere || "",
              observatii: values.observatii || "",
              time_stamp: time_stamp
            }
          }
        };
        
        await updateDoc(patientDocRef, updatedValues);
  
        console.log("Recomandari added successfully.");
        setAdaugaRecomandariVisible(false);
        formRecomandari.resetFields();
      } catch (error) {
        console.error("Error adding recomandari:", error);
      }
    });
};


  
  
  
  
  
  



  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "pacienti", id));
  
      if (loggedInUserId) {
        const medicDocRef = doc(db, "medici", loggedInUserId);
        await updateDoc(medicDocRef, {
          pacienti: arrayRemove(id)
        });
      } else {
        console.error('No user logged in.');
      }
  
      setDataSource(prevDataSource => prevDataSource.filter(patient => patient.id !== id));
    } catch(error) {
      console.error("Error deleting patient:", error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditing(null);
    
  };

  const handleCancelAlarme = () => {
    setAlarmeVisible(false);
  };

  const handleCancelView = () => {
    setIsViewVisible(false);
  };

  const handleCancelRecomandari = () => {
    setRecomandariVisible(false);
  };

  const handleCancelAdaugaRecomandari = () => {
    setAdaugaRecomandariVisible(false);
  };


  const showAlarme = (record: Item | null) => {
    if (record) {
      
    } else {
      formAlarme.resetFields();
    }
    setAlarmeVisible(true);
  };


  

  const showRecomandari  = () => {
    setRecomandariVisible(true);
  };

  const showAdaugareRecomandari = () => {
    formRecomandari.resetFields();
    setAdaugaRecomandariVisible(true);
  };
      
  return (
    <>
    <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#d80242",
            colorInfo: "#d80242"
            
          },
        }}
      >
          <div className='back_button'>
          <Button shape="round" type="primary" htmlType="submit" onClick={() => navigate('/home')}>
          Deconectare
          </Button>
          </div>
        <div className='header_fisa'>
  <img src="/banner_brand.png" className='banner_brand' />
  </div>
  <Button type="primary" shape="round" onClick={() => showModal(null)}>
        Adăugare pacient
      </Button>
      <br/><br/>

        <Table columns={columns} dataSource={dataSource} size="small" pagination={{ hideOnSinglePage: true }} rowKey="id" />
       
    <Modal
        title={editing ? 'Editare fişă pacient' : 'Adăugare pacient'}
        okText="Salvează"
        open={isModalVisible} 
        onCancel={handleCancel}
        footer={null} 
    >
<Form form={formDatePacient} layout="vertical"  autoComplete='off'>
    
    <Title level={5}>Date personale</Title>
 

    <Space direction="horizontal" size={15}>
      <Form.Item label="Nume" name="nume"  rules={[{ required: editing == null, message: 'Vă rog să introduceți numele.' }]}>
        <Input disabled={editing !== null}/>
      </Form.Item>
      <Form.Item label="Prenume" name="prenume" rules={[{ required: editing == null, message: 'Vă rog să introduceți prenumele.' }]}>
        <Input disabled={editing !== null}/>
      </Form.Item>
    </Space>
   
    <Space direction="horizontal" size={15}>
    <Form.Item label="Vârstă" name="varsta" rules={[{ required: editing == null, message: 'Vă rog să introduceți vârsta.' }]}>
        <InputNumber min={1} max={99} maxLength={2} style={{ width: 60 }} disabled={editing !== null}/>
    </Form.Item>
    <Form.Item label="CNP" name="CNP" rules={[{ required: editing == null, message: 'Vă rog să introduceți CNP.' }]}>
        <InputNumber maxLength={13} style={{ width: 150 }} disabled={editing !== null}/>
      </Form.Item>
      </Space>
      <Title level={5}>Adresă</Title>
      

      <Space direction="horizontal" size={15}>
      <Form.Item label="Stradă" name="strada" rules={[{ required: true, message: 'Vă rog să introduceți strada.' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Număr" name="numar" rules={[{ required: true, message: 'Vă rog să introduceți numărul.' }]}>
        <Input style={{ width: 60 }} />
      </Form.Item>
      <Form.Item label="Bloc" name="bloc" >
        <Input style={{ width: 60 }} />
      </Form.Item>
      <Form.Item label="Etaj" name="etaj">
        <InputNumber style={{ width: 60 }} />
      </Form.Item>
      <Form.Item label="Apartament" name="apartament" >
        <InputNumber style={{ width: 60 }} />
      </Form.Item>
      </Space>

      <Space direction="horizontal" size={15}>
  
      <Form.Item label="Oraș" name="oras" rules={[{ required: true, message: 'Vă rog să introduceți orașul.' }]}>
        <Input style={{ width: 120 }} />
      </Form.Item>
      <Form.Item label="Judeţ" name="judet" rules={[{ required: true, message: 'Vă rog să introduceți judeţul.' }]}>
        <Input style={{ width: 120 }}/>
      </Form.Item>
      <Form.Item label="Cod poștal" name="codPostal" rules={[{ required: true, message: 'Vă rog să introduceți codul poștal.' }]}>
        <InputNumber maxLength={6}/>
      </Form.Item>
      </Space>
      <Title level={5}>Contact</Title>
     
      <Space direction="horizontal" size={15}>
      <Form.Item label="Număr telefon" name="telefon" rules={[{ required: true, message: 'Vă rog să introduceți numărul de telefon.' }]}>
        <Input maxLength={10} style={{ width: 100 }}/>
      </Form.Item>
      <Form.Item label="Adresă email" name="email" rules={[
      {
        type: 'email',
        message: 'Vă rog să introduceți o adresă de email validă.',
      },
      {
        required: editing == null,
        message: 'Vă rog să introduceți adresa de email.',
      },
    ]}>
        <Input style={{ width: 250 }} disabled={editing !== null}/>
      </Form.Item>
      </Space>
      <Space direction="horizontal" size={15}>
      <Form.Item label="Profesie" name="profesie" rules={[{ required: true, message: 'Vă rog să introduceți profesia.' }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Loc de muncă" name="locDeMunca" rules={[{ required: true, message: 'Vă rog să introduceți locul de muncă.' }]}>
        <Input />
      </Form.Item>
     </Space>
     <Title level={5}>Detalii medicale</Title>
      
      <Form.Item label="Istoric medical" name="istoric" rules={[{ required: true, message: 'Vă rog să introduceți istoricul medical.' }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Alergii" name="alergii" rules={[{ required: true, message: 'Vă rog să introduceți alergiile.' }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Consultaţii cardiologice" name="consultatii" rules={[{ required: true, message: 'Vă rog să introduceți consultaţiile cardiologice.' }]}>
        <Input.TextArea />
      </Form.Item>

    
      <Form.Item>
        <Button className="salvare_pacient" shape="round" type="primary" htmlType="submit"  onClick={handleOk} >
          Salvează
        </Button>
      </Form.Item>
      
    </Form>
    </Modal>


    <Modal title="Alarme"
     open={isAlarmeVisible} 
     okText="Salvează"
     onCancel={handleCancelAlarme}
     footer={null} 
    >
   
      <div className='delimiter'>
        <Title level={5}>Măsuratori:</Title>
        <Descriptions bordered items={ValorileActualeModul} size="small" />
        </div>
        <br/>
       
        <Form form={formAlarme}  autoComplete='off'>
        <div className='delimiter'>
        <Title level={5}>Limite repaus</Title>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Puls:</Title>
        </Col>
        <Col className="gutter-row" >
        <Form.Item label="Minim" name="puls_min_repaus">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Maxim" name="puls_max_repaus" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Temperatură:</Title>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Minim" name="temp_min_repaus">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Maxim" name="temp_max_repaus" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Umiditate:</Title>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Minim" name="umid_min_repaus">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Maxim" name="umid_max_repaus" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        </Row>
        </div>  
        <br/>
        <div className='delimiter'>
        <Title level={5}>Limite mișcare</Title>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Puls:</Title>
        </Col>
        <Col className="gutter-row" >
        <Form.Item label="Minim" name="puls_min_miscare">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Maxim" name="puls_max_miscare" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Temperatură:</Title>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Minim" name="temp_min_miscare">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Maxim" name="temp_max_miscare" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Umiditate:</Title>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Minim" name="umid_min_miscare">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        <Col className="gutter-row">
        <Form.Item label="Maxim" name="umid_max_miscare" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Col>
        </Row>
        </div>  
        <br/>
        <div className='delimiter'>  
        <Title level={4}>ECG:</Title>
        <div>Grafic ECG</div>
        </div>  
 
        <br/>
        <div className='delimiter'> 
        <Form.Item >
        <Title level={5}>Setați alarmă</Title>
        <Switch />
        </Form.Item>
       </div>
       <br/>
        <Form.Item>
          <Button shape="round" type="primary" htmlType="submit">
            Salvează
          </Button>
        </Form.Item>
      </Form>
    </Modal>

    
        <Modal title=""
         open={isRecomandariVisible} 
         okText="Salvează"
         onCancel={handleCancelRecomandari}
         footer={null} >

        
{selectedPatient && (
    <>
      <Space direction="vertical" size={15}>
        
       
      <div>
      Recomandări anterioare pentru pacientul <b>{selectedPatient.nume_prenume}</b>:
  <br />
  <br />
  {ultimeleRecomandari.length === 0 ?  (
    <p>Nu există recomandări anterioare.</p>
  ) : ( 
    ultimeleRecomandari.map((recommendation, index) => (
      
<Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Titlu" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{recommendation.titlu}</Descriptions.Item>
  <Descriptions.Item label="Descriere" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{recommendation.descriere}</Descriptions.Item>
  <Descriptions.Item label="Observații" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{recommendation.observatii}</Descriptions.Item>
  <Descriptions.Item label="Data și ora" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{recommendation.time_stamp}</Descriptions.Item>    
</Descriptions>
    ))
  )}
</div>
      </Space>
    </>
  )}
  <br/>
  <br/>
        <Button shape="round" type="primary" htmlType="submit" onClick={() =>{ showAdaugareRecomandari(); }} >
            Adaugă
        </Button>  

        <Modal title="Adăugare recomandări" open={isAdaugaRecomandariVisible} 
         okText="Salvează"
         onCancel={handleCancelAdaugaRecomandari}
        
         footer={null} >  
         <Form form={formRecomandari}  autoComplete='off'>
        <Title level={5}>Titlu</Title>
         <Form.Item name="titlu" rules={[{ required: true, message: 'Vă rog să introduceți titlul.' }]}>
         <Input style={{ width: 200 }}/>
        </Form.Item>
        <Title level={5}>Descriere</Title>
        <Form.Item  name="descriere" rules={[{ required: true, message: 'Vă rog să introduceți descrierea.' }]}>
         <Input style={{ width: 200 }}/>
        </Form.Item>
        <Title level={5}>Observații</Title>
        <Form.Item name="observatii">
         <Input.TextArea/>
        </Form.Item>
        <Form.Item>
          <Button shape="round" type="primary" htmlType="submit" onClick={() => { handleSalveazaRecomandari();  }}>
            Salvează
          </Button>
        </Form.Item>
        </Form>
        </Modal>
        </Modal>
    <Modal
        title="Detalii pacient"
        open={isViewVisible}
        onCancel={handleCancelView}
        footer={null}
      >
        {selectedPatient && (
          <>
          <Space direction="vertical" size={15}>
            <Descriptions items={items} bordered>
            </Descriptions>
            </Space>
            </>
        )}
      </Modal>
    </ConfigProvider>



    </>
  );
};

export default Pacienti;



