import  { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, setDoc, arrayUnion, arrayRemove, getDoc, onSnapshot } from 'firebase/firestore';
import { db,  createUser, auth  } from './Firebase'
import { Table, Button, Space, Modal, ConfigProvider, Switch, Form, Input, InputNumber, Popconfirm, Descriptions, DescriptionsProps } from 'antd';
import { EditFilled, DeleteFilled, EyeFilled} from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import { Item } from '../types';
import { useNavigate } from 'react-router-dom';



const Tabel_pacienti: React.FC = () => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModulInteligentVisible, setModulInteligentVisible] = useState(false);
  const [isRecomandariVisible, setRecomandariVisible] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dataSource, setDataSource] = useState<Item[]>([]);
  const [form] = Form.useForm();
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const columns = [
    
    { title: 'Nume', dataIndex: 'nume_prenume', render: (_text: string, record: Item) => (
      <span>{record.nume_prenume}</span>
    )},
    { title: 'Vârstă', dataIndex: 'varsta' },
    { title: 'CNP', dataIndex: 'CNP' },
    { title: 'Adresă', dataIndex: 'adresa', render: (_text: string, record: Item) => (
      <span>{record.adresa}</span>
    )},
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
      title: 'Date modul\ninteligent',
      key: 'modul_inteligent',
      width: 80,
      render: (record: Item) => (
        <Button shape="round" className="view_button" onClick={() =>{ showModulInteligent(record);}}>
          <EyeFilled />
        </Button>
          
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (record: Item) => (

        <Space  direction="vertical">
          <Button shape="round" onClick={() =>{ showModal(record);  setEditing(record);}} className='action_button' ><EditFilled /></Button>
          <Popconfirm title="Sunteţi sigur că vreţi să ştergeţi acest pacient?" onConfirm={() => handleDelete(record.id)} okText="Da" cancelText="Nu">
            <Button shape="round"  className='action_button' ><DeleteFilled /></Button>
            </Popconfirm>
        </Space>

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

  

  const getCurrentUser = () => {
    const user = auth.currentUser; 
    return user ? user.uid : null; 
  };
  

  useEffect(() => {
    const medic_id = getCurrentUser();
    setLoggedInUserId(medic_id);
    const getPatients = async () => {
      if (medic_id) {
        const medicDocRef = doc(db, "medici", medic_id);
        const unsubscribe = onSnapshot(medicDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const pacientiArray = docSnapshot.data().pacienti || [];
            const patientsPromises = pacientiArray.map(async (patientId: string) => {
              const patientDocSnapshot = await getDoc(doc(db, "pacienti", patientId));
              return { ...patientDocSnapshot.data(), id: patientDocSnapshot.id } as Item;
            });
            const patients = await Promise.all(patientsPromises);
            setDataSource(patients);
          } else {
            setDataSource([]);
          }
        });
        return () => unsubscribe();
      }
    };
    getPatients();
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
        form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
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
    form.validateFields().then(async (values) => {
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
      form.resetFields();
  
      const data = await getDocs(collection(db, "pacienti"));
      const filteredData = data.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }) as Item)
        .filter((patient) => patient.medic_id === loggedInUserId);
  
      setDataSource(filteredData);
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

  const handleCancelModul = () => {
    setModulInteligentVisible(false);
  };

  const handleCancelRecomandari = () => {
    setRecomandariVisible(false);
  };


  const showModulInteligent = (record: Item | null) => {
    if (record) {
      
    } else {
      form.resetFields();
    }
    setModulInteligentVisible(true);
  };

  const showRecomandari = (record: Item | null) => {
    if (record) {
      
    } else {
      form.resetFields();
    }
    setRecomandariVisible(true);
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

        <Table columns={columns} dataSource={dataSource} size="small" pagination={{ hideOnSinglePage: true }} rowKey="id"/>
       
    <Modal
        title={editing ? 'Editare fişă pacient' : 'Adăugare pacient'}
        okText="Salvează"
        open={isModalVisible} 
        onCancel={handleCancel}
        footer={null} 
    >
<Form form={form} layout="vertical"  autoComplete='off'>
    
    <Title level={5}>Date personale</Title>
 

    <Space direction="horizontal" size={15}>
      <Form.Item label="Nume" name="nume"  rules={[{ required: true, message: 'Vă rog să introduceți numele.' }]}>
        <Input/>
      </Form.Item>
      <Form.Item label="Prenume" name="prenume" rules={[{ required: true, message: 'Vă rog să introduceți prenumele.' }]}>
        <Input/>
      </Form.Item>
    </Space>
   
    <Space direction="horizontal" size={15}>
    <Form.Item label="Vârstă" name="varsta" rules={[{ required: true, message: 'Vă rog să introduceți vârsta.' }]}>
        <InputNumber min={1} max={99} maxLength={2} style={{ width: 60 }}/>
    </Form.Item>
    <Form.Item label="CNP" name="CNP" rules={[{ required: true, message: 'Vă rog să introduceți CNP.' }]}>
        <InputNumber maxLength={13} style={{ width: 150 }}/>
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
        required: true,
        message: 'Vă rog să introduceți adresa de email.',
      },
    ]}>
        <Input style={{ width: 250 }}/>
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
    <Modal title="Date modul inteligent"
    open={isModulInteligentVisible} 
    okText="Salvează"
     
        onCancel={handleCancelModul}
        footer={null} 
    >
    <Title level={4}>Valori citite:</Title>
        <Descriptions bordered items={ValorileActualeModul} size="small" />
        <br/>
       
       <Form form={form}  autoComplete='off'>
       <div className='delimiter'>
       <Title level={4}>Limite:</Title>
       <Title level={5}>Puls</Title>
       <Space direction="horizontal" size={15}>
        <Form.Item label="Minim" name="puls_min">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        <Form.Item label="Maxim" name="puls_max" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Space>

       <Title level={5}>Temperatură</Title>
       <Space direction="horizontal" size={15}>
        <Form.Item label="Minim" name="temp_min">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        <Form.Item label="Maxim" name="temp_max" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Space>
       
        <Title level={5}>Umiditate</Title>
       <Space direction="horizontal" size={15}>
        <Form.Item label="Minim" name="umid_min">
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        <Form.Item label="Maxim" name="umid_max" >
        <InputNumber style={{ width: 70 }}/>
        </Form.Item>
        </Space>
        </div>  
        <br/>
        <div className='delimiter'>  
        <Title level={4}>ECG:</Title>
        <div>Grafic ECG</div>
        </div>  
        <br/>
        <div className='delimiter'>
        <Title level={4}>Recomandări:</Title>
        <div>Recomandari anterioare:<br/>
          1. ...<br/>
          2. ...<br/>
          3. ...<br/>
          </div>  
        <br/>
        <Button shape="round" type="primary" htmlType="submit" onClick={() =>{ showRecomandari(null)}} >
            Adaugă
        </Button>  
        <Modal title="Recomandări" open={isRecomandariVisible} 
         okText="Salvează"
         onCancel={handleCancelRecomandari}
         footer={null} >  
        
        <Title level={5}>Tip</Title>
         <Form.Item   name="titlu">
         <Input style={{ width: 200 }}/>
        </Form.Item>
        <Title level={5}>Durată zilnică</Title>
        <Form.Item   name="durata">
         <Input style={{ width: 200 }}/>
        </Form.Item>
        <Title level={5}>Alte indicaţii</Title>
        <Form.Item   name="altele">
         <Input.TextArea/>
        </Form.Item>
        <Form.Item>
          <Button shape="round" type="primary" htmlType="submit">
            Salvează
          </Button>
        </Form.Item>
         
        </Modal>
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

    </ConfigProvider>



    </>
  );
};

export default Tabel_pacienti;




