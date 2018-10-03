import React, { Component } from 'react';
import { Layout, Menu, Button, Alert, Row, Col } from 'antd';

import Home from '../components/Home';
import Article from '../components/Article';
import Details from '../components/Details';
import Wallet from '../components/Wallet';
//import Ipfstest from '../components/Ipfstest';
import ControlledEditor from '../components/Editer';
import Sr from '../components/Sr';

import { auth, getBanlance, } from '../request/request.js';

import { Route, HashRouter, Link } from 'react-router-dom';

/* 导航条右上角Dropdown 个人信息
const menu = (
  <Menu>
    <Menu.Item>
      <Link to='article'>我的文章</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to='article'>我的文章</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to='article'>我的文章</Link>
    </Menu.Item>
  </Menu>
);*/

// const history = createHistory()
let scatter = null;
const { Header, Content, Footer } = Layout;
let divstyle = {
  float: 'right',
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scatterState: 0, // 0 is not start to check and 1 is start to check and 2 is check success
      isLogin: false,
      identity: null,
      name: null,
      balance: 0,
    };
    this.handleGetBanlance = this.handleGetBanlance.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    //this.sendMoney = this.sendMoney.bind(this);
  }
  componentWillMount() {
    this.setState({
      scatterState: 1,
    });
    document.addEventListener('scatterLoaded', scatterExtension => {
      scatter = window.scatter;
      //this.handleAuth();
      this.setState({
        scatterState: 2,
      });
    });
  }
  handleAuth() {

    if(this.state.scatterState !==2){
      alert('scatter插件未安装，请先安装插件');
    }else{
      auth()
        .then(identity => {
          // This would give back an object with the required fields such as `firstname` and `lastname`
          // as well as add a permission for your domain or origin to the user's Scatter to allow deeper
          // requests such as requesting blockchain signatures, or authentication of identities.
          console.log(identity);
          window.sessionStorage.setItem('identity',identity);
          this.setState({
            isLogin: true,
            identity: identity,
            name: identity.accounts[0].name,
          });
        })
        .catch(error => {
          //...
          console.log('获取身份失败');
        });
    }
  }
  handleGetBanlance() {
    const that = this;
    console.log(this);
    getBanlance().then(result => {
      console.log(result);
      that.setState({
        balance: result.rows[0].balance,
      });
    });
  }

  render() {
    return (
      <HashRouter>
        <Layout>
          <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
            <Row>
              <Col span={0}>
                <div className="logo" />
              </Col>
              <Col span={22}>
                <Menu
                  theme="dark"
                  mode="horizontal"
                  defaultSelectedKeys={['1']}
                  style={{ lineHeight: '64px' }}
                >
                  <Menu.Item key="1">
                    <Link to="/home">入门</Link>
                  </Menu.Item>
                  <Menu.Item key="2">
                    <Link to="/article" replace>
                      文章
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="3">
                    <Link to={{ pathname: '/sr', data: scatter }} replace>
                      订阅
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="4">
                    <Link to={{ pathname: '/wallet', data: scatter }} replace>
                      钱包
                    </Link>
                  </Menu.Item>
                  <Menu.Item key="5">
                    <Link to="/editer" replace>
                      发布
                    </Link>
                  </Menu.Item>
                </Menu>
              </Col>
              <Col span={2}>
                <div style={divstyle}>
                  {scatter === null ||
                  scatter.identity === null ||
                  scatter.identity.accounts === null ? (
                    <Button ghost onClick={this.handleAuth}>
                      Scatter登录
                    </Button>
                  ) : (
                    <Button ghost>{scatter.identity.accounts[0].name}</Button>
                  )}
                </div>
              </Col>
            </Row>
          </Header>

          <Content style={{ padding: '0 50px', height: '100%', marginTop: 64 }}>
            {/* <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb> 
            {scatterState !== 2?
            <Alert message="警告"
              description="未发现scatter插件，请安装."
              type="error"
              closable
              style={{ margin: '8px 0' }}
              showIcon />
              :null}*/}
            <div style={{ background: '#fff', padding: 24, minHeight: 800 }}>
              {/*
            <Button onClick = {this.handleAuth}>Auth</Button>
            <Button onClick = {this.handleGetBanlance}>getBanlance</Button>
            <Button onClick = {this.sendMoney}>sendMoney</Button>*/}

              <Route exact path="/home" component={Home} />
              <Route exact path="/article" component={Article} />
              <Route path="/article/:arthash" component={Details} />
              <Route path="/wallet" component={Wallet} />
              {/*<Route path="/ipfstest" component={Ipfstest} />*/}
              <Route path="/editer" component={ControlledEditor} />
              <Route path="/sr" component={Sr} />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            Waiting for you ©2018 Created with love and hope.
          </Footer>
        </Layout>
      </HashRouter>
    );
  }
}
export default App;
