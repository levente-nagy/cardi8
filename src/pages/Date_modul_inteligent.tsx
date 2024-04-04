import { Form, Input, Button, Descriptions, Typography, Space } from 'antd';
import type { DescriptionsProps } from 'antd';
const { Title } = Typography;
import { Item } from '../types';


interface Props {
  existingItem?: Item | null;
  onAdd: (newItem: Item) => void;
  onUpdate: (updatedItem: Item) => void;
}


const ValorileActuale: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'ECG',
    children: 'N/A',
    span: 3,
  },
  {
    key: '2',
    label: 'Puls',
    children: 'N/A',
    span: 3,
  },
  {
    key: '3',
    label: 'Temperatură',
    children: 'N/A',
    span: 3,
  },
  {
    key: '4',
    label: 'Umiditate',
    children: 'N/A',
    span: 3,
  },


];


const DateModulInteligent: React.FC<Props> = ({ existingItem, onAdd, onUpdate }) => {
  const [form] = Form.useForm();
  

  const onFinish = (values: Item) => {
    if (existingItem) {
      onUpdate({ ...existingItem, ...values });
    } else {
      onAdd(values);
    }
    form.resetFields();
  };

  return (
    <div>
     
      
        <Title level={5}>Valori actuale:</Title>
        <Descriptions bordered items={ValorileActuale} size="small" />

      
       <Title level={5}>Valori normale:</Title>
       
       <Form form={form} onFinish={onFinish} initialValues={existingItem || undefined} autoComplete='off'>
       <Space direction="horizontal" size={15}>
        <Form.Item label="ECG" name="ecg_medic">
        <Input style={{ width: 100 }}/>
        </Form.Item>
        <Form.Item label="Temperatură" name="temperatura_medic" >
        <Input style={{ width: 100 }}/>
        </Form.Item>


        </Space>
        <Space direction="horizontal" size={15}>
        <Form.Item label="Puls" name="puls_medic" >
        <Input style={{ width: 100 }}/>
        </Form.Item>

        <Form.Item label="Umiditate" name="umiditate_medic" >
        <Input style={{ width: 100 }}/>
        </Form.Item>
        </Space>
        <Title level={5}>Recomandări:</Title>
         <Form.Item  name="recomandari">
         <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button shape="round" type="primary" htmlType="submit">
            Salvează
          </Button>
        </Form.Item>
      </Form>
      
    </div>
  );
};

export default DateModulInteligent;
