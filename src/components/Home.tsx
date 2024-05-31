
import { Button, Flex, ConfigProvider } from 'antd';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {

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
     <img src="/banner_home.png" className='banner' />
     <Link to="/login_medic">
     <Button className='login_button' shape="round" type="primary" size="large">
          Autentificare medic
     </Button>
     </Link>
     <Link to="/login_pacient">
     <Button className='login_button' shape="round" type="primary" size="large">
          Autentificare pacient
     </Button>
     </Link>
     </Flex>
     </ConfigProvider>
  );
};

export default Home;