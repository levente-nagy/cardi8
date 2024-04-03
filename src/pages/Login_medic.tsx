import React from 'react';
import { Form, Input, Button, ConfigProvider, Flex} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';


const Login_medic: React.FC = () => {
    const onFinish = (values: any) => {
        console.log('Received values of form: ', values);
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
        <Flex gap="middle" align="center" justify="center" vertical style={{ width: '100%' }}>
        <img src="/banner_medic.png" className='banner' />
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off">
            <Form.Item
                name="username"
                rules={[{ required: true, message: 'Va rog sa va introduceti numele de utilizator!' }]}
            className='user'>
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Nume utilizator" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[{ required: true, message: 'Va rog sa va introduceti parola!' }]}
                className='pass'>
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Parola"
                />
            </Form.Item>

            <Form.Item className='sub'>
            <Link to="/pacienti">
                <Button type="primary" shape="round" htmlType="submit" className="login-form-button">
                    Authentificare
                </Button>
            </Link>
            </Form.Item>
        </Form>
        </Flex>
        </ConfigProvider>
    );
};

export default Login_medic;