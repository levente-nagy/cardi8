import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, Space, Modal, ConfigProvider, Switch } from 'antd';
import { Item } from '../types';
import AddEditItemForm from './CRUD_fisa_pacienti';
import { EditFilled, DeleteFilled, EyeFilled} from '@ant-design/icons';
import DateModulInteligent from './Date_modul_inteligent'; 

const Tabel_pacienti: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [nextId, setNextId] = useState(1);
  const [isModulVisible, setIsModulVisible] = useState(false);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nume', dataIndex: 'nume_intreg', render: (_text: string, record: Item) => (
      <span>{record.nume}<br/>{record.prenume}</span>
    )},
    { title: 'Vârstă', dataIndex: 'varsta' },
    { title: 'CNP', dataIndex: 'cnp' },
    { title: 'Adresă', dataIndex: 'adresa', render: (_text: string, record: Item) => (
      <span>{record.strada}, Nr. {record.numar}, Bl. {record.bloc}, Et. {record.etaj}, Ap. {record.apartament}<br/>Cod poștal: {record.codPostal}<br/>Loc. {record.oras}, Jud. {record.judet}</span>
    )},
    { title: 'Profesie', dataIndex: 'profesie', render: (_text: string, record: Item) => (
      <span>{record.profesie}<br/>{record.locDeMunca}</span>
    )},

    { title: 'Contact', dataIndex: 'contact', render: (_text: string, record: Item) => (
      <span>Telefon:<br/>{record.numarTelefon}<br/>Email:<br/> {record.adresaEmail}</span>
    )},
    { title: 'Detalii medicale', dataIndex: 'detalii_medicale', render: (_text: string, record: Item) => (
      <span><b>Istoric medical</b>:<br/> {record.istoricMedical}<br/><b>Alergii</b>:<br/> {record.alergii}<br/><b>Consultații cardiologice</b>:<br/> {record.consultatiiCardiologice}</span>
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
      render: (item: Item) => (
        <Button shape="round" className="view_button" onClick={() => showModul(item)}>
          <EyeFilled />
        </Button>
          
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (item: Item) => (

        <Space  direction="vertical">
          <Button shape="round" onClick={() => handleEdit(item)} className='action_button' ><EditFilled /></Button>
          <Popconfirm title="Sunteţi sigur că vreţi să ştergeţi?" okText="Da" cancelText="Anulează" onConfirm={() => handleDelete(item.id)}>
            <Button shape="round" className='action_button' ><DeleteFilled /></Button>
          </Popconfirm>
        </Space>

      ),
    },
 
  ];

  useEffect(() => {
    
    const storedData = localStorage.getItem('myTableData');
    if (storedData) {
      setData(JSON.parse(storedData));
      const lastItem = JSON.parse(storedData).slice(-1)[0];
      setNextId(lastItem ? lastItem.id + 1 : 1); 
    } else {
      setData([]); 
    }
  }, []);

  const handleAdd = async (newItem: Item) => {
    const updatedData = [...data, { ...newItem, id: nextId }];
    setData(updatedData);
    setNextId(nextId + 1);
    setIsEditing(false);
    localStorage.setItem('myTableData', JSON.stringify(updatedData)); 
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsEditing(true);
  };

  const handleUpdate = async (updatedItem: Item) => {
    const updatedData = data.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
    );
    setData(updatedData);
    setIsEditing(false);
    localStorage.setItem('myTableData', JSON.stringify(updatedData)); 
};

const handleDelete = async (id: number) => {
  const updatedData = data.filter((item) => item.id !== id);
  setData(updatedData);
  localStorage.setItem('myTableData', JSON.stringify(updatedData)); 
};

  const showModul = (item: Item) => {
    setEditingItem(item);
    setIsModulVisible(true);
  };

  const handleCloseModul = () => {
    setIsModulVisible(false);
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
  <Button type="primary" shape="round" onClick={() => setIsEditing(true)}>
        Adăugare pacient
      </Button>
      <br/><br/>

        <Table  columns={columns} dataSource={data} rowKey="id" size="small" pagination={{hideOnSinglePage: true }} />
       
    <Modal
        title={editingItem ? 'Editare fişă pacient' : 'Adăugare fisă pacient'}
        open={isEditing}
        onCancel={() => setIsEditing(false)}
        footer={null} 
    >

  <AddEditItemForm
    existingItem={editingItem} 
    onAdd={handleAdd}
    onUpdate={handleUpdate}
  />
    </Modal>

    <Modal
          title=""
          open={isModulVisible}
          onCancel={handleCloseModul}
          footer={null}
        >
        <DateModulInteligent
         existingItem={editingItem} 
         onAdd={handleAdd}
         onUpdate={handleUpdate}
         onClose={handleCloseModul} />
        </Modal>
    </ConfigProvider>
    </>
  );
};

export default Tabel_pacienti;
