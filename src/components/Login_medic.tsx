import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'; 
import { Form, Input, Button, ConfigProvider, Flex} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { app } from './Firebase';


const Login_medic: React.FC = () => {

    const [authError, setAuthError] = useState<string | null>(null);
    const navigate = useNavigate();
    const db = getFirestore(app);

    const onFinish = (values: any) => {
      const auth = getAuth(app);
      signInWithEmailAndPassword(auth, values.username, values.password)
          .then(async (userCredential) => {
           
              const user = userCredential.user;
              if (user.email && user.email.endsWith('@cardi8.ro')) {
                  setAuthError(null); 
                  navigate('/pacienti'); 
                  
                  let emailParts = user.email.split('@');
                  let fullName = emailParts[0];
                  
                 
                  fullName = fullName.replace('_', ' ');
                  
               
                  fullName = fullName.toLowerCase().replace(/\b\w/g, function (char) {
                    return char.toUpperCase();
                  });
  
                 
                  const userDocRef = doc(db, 'medici', user.uid);
                  const userDocSnapshot = await getDoc(userDocRef);
  
                  if (!userDocSnapshot.exists()) {
                      await setDoc(userDocRef, {
                          email: user.email,
                          nume: fullName,
                      });
                  }
              } else {
                  setAuthError('Numele de utilizator sau parola sunt incorecte.');
              }
          })
          .catch((error) => {
              var errorCode = error.code;
              if (errorCode === 'auth/invalid-credential') {
                  setAuthError('Numele de utilizator sau parola sunt incorecte.');
              }
          });
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
              autoComplete="off"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Vă rog să vă introduceți numele de utilizator.' }]}
                className='user'
                help={authError}
                validateStatus={authError ? 'error' : ''}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Nume utilizator" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Vă rog să vă introduceți parola.' }]}
                className='pass'
                validateStatus={authError ? 'error' : ''}
               >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="Parola"
                />
              </Form.Item>

              <Form.Item className='sub'>
            
                <Button type="primary" shape="round" htmlType="submit" className="login-form-button">
                  Authentificare
                </Button>
            
              </Form.Item>
            </Form>
          </Flex>
        </ConfigProvider>
    );
};

export default Login_medic;