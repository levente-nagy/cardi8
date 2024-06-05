import  { useState, useEffect } from 'react';
import { updateDoc, doc, deleteDoc, setDoc, arrayUnion, arrayRemove, getDoc, onSnapshot } from 'firebase/firestore';
import { db,  createUser, auth  } from './Firebase'
import { Table, Button, Space, Modal, ConfigProvider, Form, Input, InputNumber, Popconfirm, Descriptions, Badge, Flex, Row, Col, Divider, Tooltip } from 'antd';
import { EditFilled, DeleteFilled, EyeFilled, UnorderedListOutlined, BellFilled, ControlFilled, DashboardFilled, FundFilled, FileTextFilled} from '@ant-design/icons';

import { Item } from '../types';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Checkbox,  Typography } from 'antd';
import type { GetProp } from 'antd';
import { ResponsiveContainer, LineChart, CartesianGrid, YAxis, Legend, Line, XAxis } from 'recharts';
import {Tooltip as RechartsTooltip} from 'recharts';

const { Title } = Typography;

type CheckboxValueType = GetProp<typeof Checkbox.Group, 'value'>[number];

const CheckboxGroup = Checkbox.Group;

const plainOptions: string[] = ['Detalii pacient', 'Recomandări', 'Alarme', 'Măsurători', 'ECG'];
const defaultCheckedList: string[] = [];

const Pacienti: React.FC = () => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMasuratoriVisible, setMasuratoriVisible] = useState(false);
  const [isRecomandariVisible, setRecomandariVisible] = useState(false);
  const [isAdaugaLimiteVisible, setAdaugaLimiteVisible] = useState(false);
  const [isECGVisible, setECGVisible] = useState(false);
  const [isAlarmeVisible, setAlarmeVisible] = useState(false);
  const [isAdaugaRecomandariVisible, setAdaugaRecomandariVisible] = useState(false);
  const [isViewVisible, setIsViewVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [dataSource, setDataSource] = useState<Item[]>([]);
  const [formDatePacient] = Form.useForm();
  const [formRecomandari] = Form.useForm();
  const [formLimite] = Form.useForm();
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Item | null>(null);
  const [ultimeleRecomandari, setUltimeleRecomandari] = useState<any[]>([]);
  const [ultimeleMasuratori, setUltimeleMasuratori] = useState<any[]>([]);
  const [ultimeleAlarme, setUltimeleAlarme] = useState<any[]>([]);
  const [limite, setLimite] = useState<any[]>([]);
  const [ecgData, setECGData] = useState<any[]>([]);
  const [badgeCounts, setBadgeCounts] = useState<{ [key: string]: number }>(() => {
    const savedBadgeCounts = localStorage.getItem('badgeCounts');
    return savedBadgeCounts ? JSON.parse(savedBadgeCounts) : {};
  });

  const [lastKnownAlarmCounts, setLastKnownAlarmCounts] = useState<{ [key: string]: number }>(() => {
    const savedAlarmCounts = localStorage.getItem('lastKnownAlarmCounts');
    return savedAlarmCounts ? JSON.parse(savedAlarmCounts) : {};
  });

  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(defaultCheckedList);
  const [showReportDetalii, setShowReportDetalii] = useState<boolean>(false);
  const [showReportRecomandari, setShowReportRecomandari] = useState<boolean>(false);
  const [showReportAlarme, setShowReportAlarme] = useState<boolean>(false);
  const [showReportMasuratori, setShowReportMasuratori] = useState<boolean>(false);
  const [showReportECG, setShowReportECG] = useState<boolean>(false);
  const formattedECGData = ecgData.map((value, index) => ({ value, time: index }));


  const navigate = useNavigate();
  
  const columns = [
    
    {
      title: 'Nume',
      dataIndex: 'nume_prenume',
      sorter: (a: Item, b: Item) => {
        if (!a.nume_prenume || !b.nume_prenume) {
          return 0;
        }
        return a.nume_prenume.localeCompare(b.nume_prenume);
      },
      defaultSortOrder: 'ascend' as 'ascend' | 'descend' | null,
      render: (_text: string, record: Item) => <span>{record.nume_prenume}</span>,
    },
    
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
      title: 'Modul inteligent',
      key: 'masuratori',
      width: 80,
      
      render: (record: Item) => (
        <Flex gap="small" vertical justify="center" align='center'>
          <Tooltip title="Limite">
        <Button shape="round" className="view_button" onClick={() =>{ showAdaugareLimite(); handleSelectPatient(record);}}>
        <ControlFilled />
        </Button>
        </Tooltip>
        
        <Badge count={badgeCounts[record.id] || 0}>
        <Tooltip title="Alarme">
        <Button shape="round" className="view_button" onClick={() =>{ showAlarme(record.id); handleSelectPatient(record);}}>
        <BellFilled />
        </Button>
        </Tooltip>
        </Badge>
        <Tooltip title="Măsurători">
        <Button shape="round" className="view_button" onClick={() =>{ showMasuratori(); handleSelectPatient(record);}}>
        <DashboardFilled />
        </Button>
        </Tooltip>
        <Tooltip title="ECG">
        <Button shape="round" className="view_button" onClick={() =>{ showECG(); handleSelectPatient(record);}}>
        <FundFilled />
        </Button>
        </Tooltip>
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
        <Tooltip title="Vizualizare">
        <Button shape="round" className="view_button" onClick={() =>{setSelectedPatient(record);
              setIsViewVisible(true);}}>
          <EyeFilled />
        </Button>
        </Tooltip>
        <Tooltip title="Rapoarte">
        <Button shape="round" className="view_button" onClick={() =>{setSelectedPatient(record); handleSelectPatient(record);
              showReport()}}>
          <FileTextFilled />
        </Button>
        </Tooltip>
        <Tooltip title="Modificare">
          <Button shape="round" onClick={() =>{ showModal(record);  setEditing(record);}} className='action_button' ><EditFilled /></Button>
          </Tooltip>
          <Popconfirm title="Sunteţi sigur că vreţi să ştergeţi acest pacient?" onConfirm={() => handleDelete(record.id)} okText="Da" cancelText="Nu">
          <Tooltip title="Ştergere">
            <Button shape="round"  className='action_button' ><DeleteFilled /></Button>
            </Tooltip>
            </Popconfirm>
        </Space>
       </Flex>
      ),
    },
 
  ];

  const onChange = (list: CheckboxValueType[]) => {
    setCheckedList(list);
    setShowReportDetalii(list.includes('Detalii pacient'));
    setShowReportRecomandari(list.includes('Recomandări'));
    setShowReportAlarme(list.includes('Alarme'));
    setShowReportMasuratori(list.includes('Măsurători'));
    setShowReportECG(list.includes('ECG'));
  };


  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const medic_id = user.uid;
        setLoggedInUserId(medic_id);
        const getPatients = async () => {
          try {
            const medicDocRef = doc(db, "medici", medic_id);
            const unsubscribeSnapshot = onSnapshot(medicDocRef, async (docSnapshot) => {
              if (docSnapshot.exists()) {
                const pacientiArray = docSnapshot.data().pacienti || [];
                const patientsPromises = pacientiArray.map(async (patientId: string) => {
                  const patientDocSnapshot = await getDoc(doc(db, "pacienti", patientId));
                  return { ...patientDocSnapshot.data(), id: patientDocSnapshot.id } as Item;
                });
                const patients = await Promise.all(patientsPromises);
                setDataSource(patients);
                patients.forEach(patient => setupAlarmListener(patient.id));
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

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('badgeCounts', JSON.stringify(badgeCounts));
    localStorage.setItem('lastKnownAlarmCounts', JSON.stringify(lastKnownAlarmCounts));
  }, [badgeCounts, lastKnownAlarmCounts]);

  const setupAlarmListener = (patientId: string) => {
    const patientDocRef = doc(db, 'pacienti', patientId);

    onSnapshot(patientDocRef, (snapshot) => {
      const patientData = snapshot.data();
      if (patientData && patientData.alarme) {
        const alarmeArray = Object.values(patientData.alarme);
        const currentAlarmCount = alarmeArray.length;

        setLastKnownAlarmCounts((prevCounts) => {
          const prevAlarmCount = prevCounts[patientId] || 0;
          if (currentAlarmCount > prevAlarmCount) {
            setBadgeCounts((prevBadgeCounts) => ({
              ...prevBadgeCounts,
              [patientId]: (prevBadgeCounts[patientId] || 0) + (currentAlarmCount - prevAlarmCount)
            }));
          }
          return {
            ...prevCounts,
            [patientId]: currentAlarmCount
          };
        });
      }
    }, (error) => {
      console.error('Error fetching alarme:', error);
    });
  };


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
            return newDataSource;
          });
        }
      } else {
        console.error('No user created.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  
  const handlePacient = async () => {
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
        setDataSource(prevDataSource => prevDataSource.map(patient => patient.id === editing.id ? { ...patient, ...processedValues } : patient));
      } else {
        await addPatient(processedValues as Item); 
      }
  
      setIsModalVisible(false);
      setEditing(null);
      formDatePacient.resetFields();
    });
  };
  

  const handleSelectPatient = (patient: Item) => {
    fetchUltimeleRecomandari(patient.id);
    fetchUltimeleMasuratori(patient.id);
    fetchUltimeleAlarme(patient.id);
    setSelectedPatient(patient);
    fetchECGData(patient.id);
    fetchLimite(patient.id);
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

  const fetchLimite = (patientId: string) => {
    const patientDocRef = doc(db, 'pacienti', patientId);
  
    onSnapshot(patientDocRef, (snapshot) => {
      const patientData = snapshot.data();
      if (patientData && patientData.limite_medic) {
        const limiteArray = Object.entries(patientData.limite_medic);
        setLimite(limiteArray);
      } else {
        setLimite([]);
      }
    }, (error) => {
      console.error('Error fetching limite:', error);
      setLimite([]);
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
        const existingRecomandari = patientData?.recomandari || [];

        const newRecomandare = {
          titlu: values.titlu || "",
          descriere: values.descriere || "",
          observatii: values.observatii || "",
          time_stamp: time_stamp
        };

        existingRecomandari.push(newRecomandare);
        
        const updatedValues = {
          recomandari: existingRecomandari
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

const handleSalveazaLimite = async () => {
  formLimite.validateFields().then(async (values) => {
    if (!selectedPatient) {
      console.error("No patient selected.");
      return;
    }
    try {
      const patientDocRef = doc(db, "pacienti", selectedPatient.id);
      const newLimite = {
        puls_min_repaus: values.puls_min_repaus || "",
        puls_max_repaus: values.puls_max_repaus || "",
        temp_min_repaus: values.temp_min_repaus || "",
        temp_max_repaus: values.temp_max_repaus || "",
        umid_min_repaus: values.umid_min_repaus || "",
        umid_max_repaus: values.umid_max_repaus || "",
        puls_min_miscare: values.puls_min_miscare || "",
        puls_max_miscare: values.puls_max_miscare || "",
        temp_min_miscare: values.temp_min_miscare || "",
        temp_max_miscare: values.temp_max_miscare || "",
        umid_min_miscare: values.umid_min_miscare || "",
        umid_max_miscare: values.umid_max_miscare || "",
      };
      const updatedValues = {
        limite_medic: newLimite
      };
      await updateDoc(patientDocRef, updatedValues);
      setAdaugaLimiteVisible(false);
      formLimite.resetFields();
    } catch (error) {
      console.error("Error adding limite:", error);
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

  const handleCancelMasuratori = () => {
    setMasuratoriVisible(false);
  };

  const handleCancelView = () => {
    setIsViewVisible(false);
  };

  const handleCancelReport = () => {
    setIsReportVisible(false);
  };

  const handleCancelRecomandari = () => {
    setRecomandariVisible(false);
  };

  const handleCancelAdaugaRecomandari = () => {
    setAdaugaRecomandariVisible(false);
  };

  const handleCancelAdaugaLimite = () => {
    setAdaugaLimiteVisible(false);
  };

  const handleCancelECG = () => {
    setECGVisible(false);
  };

  const handleCancelAlarme = () => {
    setAlarmeVisible(false);
  };

  const showMasuratori = () => {

    setMasuratoriVisible(true);
  };


  const showECG = () => {

    setECGVisible(true);
  };

  const showReport = () => {

    setIsReportVisible(true);
  };
  
  const showAlarme = (patientId: string) => {
    setAlarmeVisible(true);

    setBadgeCounts((prevCounts) => ({
      ...prevCounts,
      [patientId]: 0
    }));
  };

  const showRecomandari  = () => {
    setRecomandariVisible(true);
  };

  const showAdaugareRecomandari = () => {
    formRecomandari.resetFields();
    setAdaugaRecomandariVisible(true);
  };


  const showAdaugareLimite = () => {
    formLimite.resetFields();
    setAdaugaLimiteVisible(true);
  };

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

  const handlePrint = () => {
    const printSection = document.querySelector('.section-to-print') as HTMLElement;
    const bannerPrint = document.querySelector('.banner_print') as HTMLElement;
  
    if (bannerPrint) {
      bannerPrint.style.display = 'block';
    }
  
    if (printSection) {
      const nodeClone = printSection.cloneNode(true) as HTMLElement;
  
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.body.appendChild(nodeClone);
  
        const head = document.head.cloneNode(true);
        printWindow.document.head.appendChild(head as Node);
  
        const extraStyles = `
        .to_hide, .ant-modal-close {
          display: none !important;
        }
      
        .delimiter, .ant-descriptions {
          page-break-inside: avoid !important;
        }
      
        .banner_print {
          display: block !important;
          text-align: center !important;
        }
      
        .banner_print_img {
          width: 10rem !important;
          max-width: 100% !important;
        }
      
        html {
          overflow: scroll !important;
          overflow-x: hidden !important;
        }
      
        ::-webkit-scrollbar {
          width: 0 !important;
          background: transparent !important;
        }
      
        ::-webkit-scrollbar-thumb {
          width: 0 !important;
        }
      
        .section-to-print, .section-to-print * {
          visibility: visible !important;
        }
      
        .section-to-print {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          page-break-inside: avoid !important;
        }
      
        .ant-modal {
          position: static !important;
          overflow: visible !important;
          max-height: none !important;
        }
      
        .ant-modal-content {
          box-shadow: none !important;
          padding: 0 !important;
        }
      
        .tooltip {
          display: none !important;
        }
        `;
    
        const styleElement = document.createElement('style');
        styleElement.innerHTML = extraStyles;
        printWindow.document.head.appendChild(styleElement);

        // Ensure styles are applied before printing
        printWindow.document.head.appendChild(styleElement);
        printWindow.document.body.appendChild(nodeClone);
        printWindow.document.close();

        // Force reflow to ensure styles are applied
        printWindow.document.body.offsetHeight;

        // Print and close after styles are applied
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  
    if (bannerPrint) {
      bannerPrint.style.display = 'none';
    }
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
        title={editing ? 'Modificare fişă pacient' : 'Adăugare pacient'}
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
        <Button className="salvare_pacient" shape="round" type="primary" htmlType="submit"  onClick={handlePacient} >
          Salvează
        </Button>
      </Form.Item>
      
    </Form>
    </Modal>

    <Modal title="" open={isAdaugaLimiteVisible} 
         okText="Salvează"
         onCancel={handleCancelAdaugaLimite}
        width={600}
         footer={null} >  
          <>
         {selectedPatient && (
   
          <Title level={5}>Adăugare limite - <b>{selectedPatient.nume_prenume}</b></Title>
        )}



{limite.filter(([,value]) => value !== null && value !== '').length > 0 && (
    <div className='delimiter'>   
        <Title level={5}>Limite anterioare</Title>
        {['repaus', 'miscare'].map(condition => {
            const conditionLimits = limite.filter(([key, value]) => value !== null && value !== '' && key.includes(condition));
            if (conditionLimits.length === 0) {
                return null; 
            }
            let title = condition.charAt(0).toUpperCase() + condition.slice(1);
            if (condition === 'miscare') {
                title = 'Mișcare';
            }
            return (
                <div key={condition}>
                  <br/>
                    <Title level={5}>{title}</Title>
                    <Descriptions column={2} bordered size='small'>
                        {conditionLimits
                            .sort((a, b) => {
                                const keyA = a[0].includes('max') ? a[0].replace('max', 'min') : a[0].replace('min', 'max');
                                const keyB = b[0].includes('max') ? b[0].replace('max', 'min') : b[0].replace('min', 'max');
                                return keyA.localeCompare(keyB);
                            })
                            .map(([key, value]) => {
                                let formattedKey = key.replace('_', ' ');

                                formattedKey = formattedKey.replace('repaus','');
                                formattedKey = formattedKey.replace('miscare','');
                                formattedKey = formattedKey.replace('max', 'maxim');
                                formattedKey = formattedKey.replace('min', 'minim');
                                formattedKey = formattedKey.replace(/temp/i, 'Temperatură');
                                formattedKey = formattedKey.replace(/umid/i, 'Umiditate');
                                formattedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
                                formattedKey = formattedKey.replace('_', ' ');
                        
                                return (
                                    <Descriptions.Item label={formattedKey} key={key}>{value}</Descriptions.Item>
                                );
                            })
                        }
                    </Descriptions>
                </div>
            );
        })}
    </div>
)}
        
        

          <Form form={formLimite}  autoComplete='off'>
        <div className='delimiter'>
        <Title level={5}>Limite repaus</Title>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} align="top"> 
        <Col className="gutter-row" span={7}>
        <Title level={5}>Puls:</Title>
        </Col>
        <Col className="gutter-row" >
        <Form.Item label="Minim" name="puls_min_repaus" >
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
        <Form.Item>
          <Button shape="round" type="primary" htmlType="submit" onClick={() => { handleSalveazaLimite();  }}>
            Salvează
          </Button>
        </Form.Item>
      </Form>
      </>
 
        </Modal>

        <Modal title=""
     open={isAlarmeVisible} 
     okText="Salvează"
     onCancel={handleCancelAlarme}
     footer={null} 
    >
      {selectedPatient && (
   
   <Title level={5}>Alarme anterioare - <b>{selectedPatient.nume_prenume}</b></Title>
   
 )}
 <br/>
      <div className='delimiter'>
      <div>



  {ultimeleAlarme.length === 0 ?  (
    <Title level={5}>Nu există alarme anterioare.</Title>
  ) : ( 
    ultimeleAlarme.map((alarme, index) => (
      
     
<Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Tip"  labelStyle={{width: '20%'}} contentStyle={{width: '30%'}}>{alarme.tip}</Descriptions.Item>
  <Descriptions.Item label="Stare" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.stare}</Descriptions.Item>
  <Descriptions.Item label="Descriere"  span={3} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.descriere}</Descriptions.Item>
  <Descriptions.Item label="Comentariu" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.comentariu}</Descriptions.Item> 
  <Descriptions.Item label="Data și ora" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '20%'}}>{alarme.time_stamp}</Descriptions.Item>    
</Descriptions>


    ))
  )}
  
</div>


        </div>
      </Modal>

    <Modal title=""
     open={isMasuratoriVisible} 
     okText="Salvează"
     onCancel={handleCancelMasuratori}
     footer={null} 
    >
      {selectedPatient && (
   
   <Title level={5}>Măsurători anterioare - <b>{selectedPatient.nume_prenume}</b></Title>
   
 )}
 <br/>
      <div className='delimiter'>
      <div>
     


  {ultimeleMasuratori.length === 0 ?  (
    <Title level={5}>Nu există măsurători anterioare.</Title>
  ) : ( 
    ultimeleMasuratori.map((masuratori, index) => (
      
     
<Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
  <Descriptions.Item label="Puls"  labelStyle={{width: '10%'}} contentStyle={{width: '20%'}} span={3}>{masuratori.puls}</Descriptions.Item>
  <Descriptions.Item label="Temperatură"  labelStyle={{width: '10%'}} contentStyle={{width: '20%'}} span={3}>{masuratori.temp}</Descriptions.Item>
  <Descriptions.Item label="Umiditate"  labelStyle={{width: '10%'}} contentStyle={{width: '20%'}} span={3}>{masuratori.umid}</Descriptions.Item>
  <Descriptions.Item label="Data și ora" span={2} labelStyle={{width: '10%'}} contentStyle={{width: '20%'}}>{masuratori.time_stamp}</Descriptions.Item>    
</Descriptions>


    ))
  )}
  
</div>


        </div>
        </Modal>

        <Modal title="" open={isECGVisible} 
         okText="Salvează"
         onCancel={handleCancelECG}
        width={600}
         footer={null} >  
               {selectedPatient && (
   
   <Title level={5}>ECG - <b>{selectedPatient.nume_prenume}</b></Title>
   
 )}

       <div className='delimiter'>  
       {formattedECGData.length === 0 ?  (
    <Title level={5}>Nu există valori ECG anterioare.</Title>
  ) : (      
       <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedECGData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'Voltage (mV)', angle: -90, position: 'insideLeft' }} />
        
        <Line type="monotone" dataKey="value" stroke="#d80242" dot={false} />
      </LineChart>
    </ResponsiveContainer>
      )}
       </div>  
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
      Recomandări anterioare - <b>{selectedPatient.nume_prenume}</b>
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

        <Modal title="" open={isAdaugaRecomandariVisible} 
         okText="Salvează"
         onCancel={handleCancelAdaugaRecomandari}
        
         footer={null} >  
         {selectedPatient && (
    <>
          <Title level={5}>Adăugare recomandări - <b>{selectedPatient.nume_prenume}</b></Title>
          <br/>
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
        </>
  )}
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

            <Descriptions bordered size='small' >
  <Descriptions.Item label="Nume" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{selectedPatient?.nume_prenume}</Descriptions.Item>
  <Descriptions.Item label="Vârstă" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{selectedPatient?.varsta}</Descriptions.Item>
  <Descriptions.Item label="CNP" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{selectedPatient?.CNP}</Descriptions.Item>
  <Descriptions.Item label="Adresă" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{selectedPatient?.adresa}</Descriptions.Item>
  <Descriptions.Item label="Contact" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>
    Telefon: {selectedPatient?.telefon}
    <br />
    Email: {selectedPatient?.email}
  </Descriptions.Item>
  <Descriptions.Item label="Profesie" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>{selectedPatient?.profesie}</Descriptions.Item>
  <Descriptions.Item label="Detalii medicale" span={3} labelStyle={{width: '50%'}} contentStyle={{width: '50%'}}>
    Istoric medical: {selectedPatient?.istoric}
    <br />
    Alergii: {selectedPatient?.alergii}
    <br />
    Consultații cardiologice: {selectedPatient?.consultatii}
  </Descriptions.Item>
</Descriptions>
            </Space>
            </>
        )}
      </Modal>
      
      <Modal
        title=""
        open={isReportVisible}
        onCancel={handleCancelReport}
        footer={null}
        className='section-to-print'
       width={800}
      >
        {selectedPatient && (
<>


      <Button shape="round" type="primary" htmlType="submit" onClick={handlePrint} className='to_hide'>
        Tipărire
      </Button>
      <Divider className='to_hide'/>
      <div className='banner_print'>
      <img src="/banner_brand.png" className='banner_print_img' />
      <br/>
      <br/>
      </div>


  
<Title  level={5}>Raport pacient - <b>{selectedPatient.nume_prenume}</b></Title>



<Divider />

<Row className='to_hide'>
  <Col span={8}>
      <CheckboxGroup style={{width : "50%"}} options={plainOptions} value={checkedList} onChange={onChange} />
      </Col>
      </Row>
  
      {showReportDetalii && (
        <>
        <div className='delimiter'>
        <Title  level={5}>Detalii pacient</Title>
          
            <Descriptions bordered size='small'  >
              <Descriptions.Item label="Nume" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{selectedPatient?.nume_prenume}</Descriptions.Item>
              <Descriptions.Item label="Vârstă" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{selectedPatient?.varsta}</Descriptions.Item>
              <Descriptions.Item label="CNP" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{selectedPatient?.CNP}</Descriptions.Item>
              <Descriptions.Item label="Adresă" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{selectedPatient?.adresa}</Descriptions.Item>
              <Descriptions.Item label="Contact" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>
                Telefon: {selectedPatient?.telefon}
                <br />
                Email: {selectedPatient?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Profesie" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{selectedPatient?.profesie}</Descriptions.Item>
              <Descriptions.Item label="Detalii medicale" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>
                Istoric medical: {selectedPatient?.istoric}
                <br />
                Alergii: {selectedPatient?.alergii}
                <br />
                Consultații cardiologice: {selectedPatient?.consultatii}
              </Descriptions.Item>
            </Descriptions>
      </div>
        </>
      )}
      {showReportRecomandari && (
        <>
        <div className='delimiter'>
            <div>
            
        <Title  level={5}>Recomandări anterioare</Title>
             
           
              {ultimeleRecomandari.length === 0 ? (
                <p>Nu există recomandări anterioare.</p>
              ) : (
                ultimeleRecomandari.map((recommendation, index) => (
      
                  <Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
                    <Descriptions.Item label="Titlu" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{recommendation.titlu}</Descriptions.Item>
                    <Descriptions.Item label="Descriere" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{recommendation.descriere}</Descriptions.Item>
                    <Descriptions.Item label="Observații" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{recommendation.observatii}</Descriptions.Item>
                    <Descriptions.Item label="Data și ora" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{recommendation.time_stamp}</Descriptions.Item>    
                  </Descriptions>
                ))
              )}
            </div>
          </div>
        </>
      )}
      {showReportAlarme && (
        <>
         
            <>
            <div className='delimiter'>
        <Title  level={5}>Alarme anterioare</Title>
              
           
                <div>
                  {ultimeleAlarme.length === 0 ? (
                    <p>Nu există alarme anterioare.</p>
                  ) : (
                    ultimeleAlarme.map((alarme, index) => (
                      <Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
                        <Descriptions.Item label="Tip" span={3}  labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{alarme.tip}</Descriptions.Item>
                        <Descriptions.Item label="Stare" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{alarme.stare}</Descriptions.Item>
                        <Descriptions.Item label="Descriere"  span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{alarme.descriere}</Descriptions.Item>
                        <Descriptions.Item label="Comentariu" span={3} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{alarme.comentariu}</Descriptions.Item> 
                        <Descriptions.Item label="Data și ora" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{alarme.time_stamp}</Descriptions.Item>    
                      </Descriptions>
                    ))
                  )}
                </div>
             </div>
            </>
       
        </>
      )}
      {showReportMasuratori && (
        <>
          {selectedPatient && (
            <>
           <div className='delimiter'>
            <Title level={5}>Măsurători anterioare</Title>
            <br/>
            {ultimeleMasuratori.length !== 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ultimeleMasuratori}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis />
                    <RechartsTooltip formatter={formatTooltip} wrapperClassName='tooltip' labelFormatter={() => ""} />
                    <Legend formatter={formatLegend}  />
                    <Line type="monotone" dataKey="puls" stroke="#8884d8" />
                    <Line type="monotone" dataKey="temp" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="umid" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
                <br/>
                <br/>
                <div>
                  {ultimeleMasuratori.map((masuratori, index) => (
                    <Descriptions bordered key={index} size='small' style={{ marginBottom: '20px' }} >
                      <Descriptions.Item label="Puls"  labelStyle={{width: '20%'}} contentStyle={{width: '50%'}} span={3}>{masuratori.puls}</Descriptions.Item>
                      <Descriptions.Item label="Temperatură"  labelStyle={{width: '20%'}} contentStyle={{width: '50%'}} span={3}>{masuratori.temp}</Descriptions.Item>
                      <Descriptions.Item label="Umiditate"  labelStyle={{width: '20%'}} contentStyle={{width: '50%'}} span={3}>{masuratori.umid}</Descriptions.Item>
                      <Descriptions.Item label="Data și ora" span={2} labelStyle={{width: '20%'}} contentStyle={{width: '50%'}}>{masuratori.time_stamp}</Descriptions.Item>    
                    </Descriptions>
                  ))}
                </div>
              </>
            ) : (
              <p>Nu există măsurători anterioare.</p>
            )}
            </div>
          </>
          )}
          
        </>
      )}
      {showReportECG && (
        <>
         
            <>
            <div className='delimiter'>
        <Title  level={5}>Grafic ECG</Title>
              
        {formattedECGData.length === 0 ?  (
    <Title level={5}>Nu există valori ECG anterioare.</Title>
  ) : (      
       <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedECGData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'Voltage (mV)', angle: -90, position: 'insideLeft' }} />
       
        <Line type="monotone" dataKey="value" stroke="#d80242" dot={false} />
      </LineChart>
    </ResponsiveContainer>
      )}
             </div>
              </>
            
        </>
          
      )}


      </>
  )}


      </Modal>
    </ConfigProvider>



    </>
  );
};

export default Pacienti;



