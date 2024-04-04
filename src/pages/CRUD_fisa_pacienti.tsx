import { useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, Space, ConfigProvider, Typography } from 'antd';
import { Item } from '../types';
const { Title } = Typography;

interface Props {
  existingItem?: Item | null;
  onAdd: (newItem: Item) => void;
  onUpdate: (updatedItem: Item) => void;
}


const CRUD_fisa_pacienti: React.FC<Props> = ({ existingItem, onAdd, onUpdate }) => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Item | {}>({});

  const onFinish = (values: Item) => {
    const valuesWithNull: Item = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value === undefined ? null : value])
    ) as Item;
    
    if (existingItem) {
      onUpdate({ ...existingItem, ...valuesWithNull });
    } else {
      onAdd(valuesWithNull);
    }
    form.resetFields();
  };

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem);
    } else {
      setFormData({});
    }
    form.resetFields();
  }, [existingItem]);


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
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={formData} autoComplete='off'>
    
    <Title level={5}>Date personale</Title>
 

    <Space direction="horizontal" size={15}>
          <Form.Item label="Nume" name="nume">
            <Input />
          </Form.Item>
          <Form.Item label="Prenume" name="prenume">
            <Input />
          </Form.Item>
    </Space>
   
    <Space direction="horizontal" size={15}>
    <Form.Item label="Vârstă" name="varsta">
        <InputNumber min={1} max={99} maxLength={2} style={{ width: 60 }}/>
    </Form.Item>
    <Form.Item label="CNP" name="cnp">
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
      <Form.Item label="Număr telefon" name="numarTelefon">
        <Input maxLength={10} style={{ width: 100 }}/>
      </Form.Item>
      <Form.Item label="Adresă email" name="adresaEmail">
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
      
      <Form.Item label="Istoric medical" name="istoricMedical">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Alergii" name="alergii">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Consultaţii cardiologice" name="consultatiiCardiologice">
        <Input.TextArea />
      </Form.Item>

    
      <Form.Item>
        <Button shape="round" type="primary" htmlType="submit">
          Salvează
        </Button>
      </Form.Item>
      
    </Form>
    </ConfigProvider>
    </>
  );
};

export default CRUD_fisa_pacienti;
