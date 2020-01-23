import React, {useState} from "react";
//import "./styles.css";
import 'ant-design-pro/dist/ant-design-pro.css';
import Login from 'ant-design-pro/lib/Login';
import { Checkbox, Icon } from 'antd';

const { Tab, UserName, Password, Submit } = Login;

export const LoginPage = ({login}) => {

  const [autoLogin, setAutoLogin] = useState(true);

  const onSubmit = (err, values) => {
    login(values.username, values.password)
  }

  const changeAutoLogin = e => {
    setAutoLogin(e.target.checked)
  }

  return (
    <div className="login-warp" style={{width: '50vw'}}>
      <Login
        defaultActiveKey={'tab1'}
        onSubmit={onSubmit}>
        <Tab key="tab1" tab="Welcome to Forestcasting">
          <UserName name="username" placeholder='Username'/>
          <Password name="password" placeholder='Password'/>
        </Tab>
        <div>
          <Checkbox checked={autoLogin} onChange={changeAutoLogin}>
            Keep me logged in
          </Checkbox>
          <a style={{ float: 'right' }} href="">
            Forgot password
          </a>
        </div>
        <Submit>Login</Submit>
        <div>
          Other login methods
          <div style={{paddingLeft: '0.5rem', display: 'inline-block'}}>
            <a href=""><Icon type="google" style={{fontSize: '1.2rem'}}/></a>
          </div>
          <div style={{paddingLeft: '0.5rem', display: 'inline-block'}}>
            <a href=""><Icon type="facebook" theme="filled" style={{fontSize: '1.2rem'}} /></a>
          </div>
          <a style={{ float: 'right' }} href="">
            Register
          </a>
        </div>
      </Login>
    </div>
  );
}
