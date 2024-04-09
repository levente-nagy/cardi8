import  { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, setDoc, arrayUnion, arrayRemove, getDoc, onSnapshot } from 'firebase/firestore';
import { db,  createUser, auth  } from './Firebase'
import { Table, Button, Space, Modal, ConfigProvider, Switch, Form, Input, InputNumber, Popconfirm } from 'antd';
import { EditFilled, DeleteFilled, EyeFilled} from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import { Item } from '../types';



const Tabel_pacienti: React.FC = () => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dataSource, setDataSource] = useState<Item[]>([]);
  const [form] = Form.useForm();
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
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
      title: 'Alarmă',
      key: 'alarma',
      render: () => (
       
        <Space size="small" direction="vertical">
          <Switch />
        </Space>
    
      ),
    },
    {
      title: 'Date modul\ninteligent',
      key: 'modul_inteligent',
      width: 80,
      render: () => (
        <Button shape="round" className="view_button">
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
 
      const [profesie, locDeMunca] = record.profesie.split(',');
  
      let [strada, numar, bloc, etaj, apartament, codPostal, oras, judet] = record.adresa.split(', ');
  
      numar = numar.replace('Nr. ', '');
      bloc = bloc ? bloc.replace('Bl. ', '') : '';
      etaj = etaj ? etaj.replace('Et. ', '') : '';
      apartament = apartament ? apartament.replace('Ap. ', '') : '';
      codPostal = codPostal.replace('Cod poștal: ', '');
      oras = oras.replace('Loc. ', '');
      judet = judet.replace('Jud. ', '');
  
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
      <Form.Item label="Nume" name="nume">
        <Input/>
      </Form.Item>
      <Form.Item label="Prenume" name="prenume" >
        <Input/>
      </Form.Item>
    </Space>
   
    <Space direction="horizontal" size={15}>
    <Form.Item label="Vârstă" name="varsta">
        <InputNumber min={1} max={99} maxLength={2} style={{ width: 60 }}/>
    </Form.Item>
    <Form.Item label="CNP" name="CNP">
        <InputNumber maxLength={13} style={{ width: 150 }}/>
      </Form.Item>
      </Space>
      <Title level={5}>Adresă</Title>
      

      <Space direction="horizontal" size={15}>
      <Form.Item label="Stradă" name="strada">
        <Input />
      </Form.Item>
      <Form.Item label="Număr" name="numar" >
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
  
      <Form.Item label="Oraș" name="oras">
        <Input style={{ width: 120 }} />
      </Form.Item>
      <Form.Item label="Judeţ" name="judet" >
        <Input style={{ width: 120 }}/>
      </Form.Item>
      <Form.Item label="Cod poștal" name="codPostal">
        <InputNumber maxLength={6}/>
      </Form.Item>
      </Space>
      <Title level={5}>Contact</Title>
     
      <Space direction="horizontal" size={15}>
      <Form.Item label="Număr telefon" name="telefon">
        <Input maxLength={10} style={{ width: 100 }}/>
      </Form.Item>
      <Form.Item label="Adresă email" name="email">
        <Input style={{ width: 250 }}/>
      </Form.Item>
      </Space>
      <Space direction="horizontal" size={15}>
      <Form.Item label="Profesie" name="profesie">
        <Input />
      </Form.Item>
      <Form.Item label="Loc de muncă" name="locDeMunca">
        <Input />
      </Form.Item>
     </Space>
     <Title level={5}>Detalii medicale</Title>
      
      <Form.Item label="Istoric medical" name="istoric">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Alergii" name="alergii">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Consultaţii cardiologice" name="consultatii">
        <Input.TextArea />
      </Form.Item>

    
      <Form.Item>
        <Button shape="round" type="primary" htmlType="submit"  onClick={handleOk} >
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




