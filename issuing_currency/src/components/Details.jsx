import React, { Component } from 'react';

import {Link} from "react-router-dom";

import { Spin, Icon , List , Divider , Row , Col , Modal , Button , Popover , Input} from 'antd';

import { get } from '../tools/ipfsapi';
import { getTableRows , timeString , signfun} from '../request/request.js';



  var action = {};
  var replyFis = [];
  var replySec = [];
  var replylist = {};
  var caname = '';

  const antIcon = <Icon type="loading" style={{ 
    fontSize: 50 ,
    textAlign : 'center' ,    
    width: '300px',
    height: '350px',
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0}} spin />;

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 , height: '20px'}} ></Icon>
    {text}
  </span>
);


function checkName (){
  return window.sessionStorage.getItem('identity')
}
function scatterAlert (){
  alert("请登录scatter");
}

class Show extends Component {
  constructor(props) {
    super(props)
    this.state = {
      parid : -1,
      trigger : 'manual',
    }
  }

  handleMessage = (event) =>{
    if(checkName()){
    this.setState({
      parid : parseInt(event.target.id.slice(1),10),
      trigger : 'click',
    });
    }else{
      scatterAlert();    
      this.setState({
      trigger : 'manual',
    });}
  }

  //删除评论
  handleComDelete = (event) =>{
    if(checkName()){
    var id = event.target.id.split(':');
    signfun('code','deletecom','self',parseInt(id[0],10),caname,parseInt(id[1],10)); 
    }else{scatterAlert()}
  }

  //处理最好评论
  handleLike = (event) =>{
    if(checkName()){
    signfun('code','setbestcom','self',action.id,parseInt(event.target.id.slice(1),10),caname); 
    event.target.style.color = '#f50';
    }else{scatterAlert()}
  }

  //提交二级评论
  handleClick = (value) =>{
    if(!(this.state.parid < 0)){
      signfun('code','createcom','self',(Buffer.from(value)).toString('base64'),caname,this.state.parid,2);
    }
    this.setState({
      parid : -1,
    });
  }
  render(){
    return(   
          <List
              itemLayout="vertical"
              dataSource={replyFis}
              size="large"
              renderItem={item => (
                <div>
                <Divider />
                <List.Item actions={
                                     [<Link to="/Wallet">{item.author}</Link>,
                                     timeString(item.timestamp) , 
                                     <i className="anticon anticon-heart" onClick={ this.handleLike} id={`L${item.id}`} style = {(item.isbest)? {color: '#f50'} : null }/>,
                                     <i className="anticon anticon-delete" onClick={ this.handleComDelete}  id={`${item.id}:${item.indexnum}`}/>,  
                                     //<PopInput onMouseOver={this.handleMessage} id={`M${item.id}`}/>,  visible={this.state.pvisi}
                                     (item.indexnum !== 2) ? <Popover placement="top" content={ <Input.Search enterButton="提交" size="large"  onSearch={value =>this.handleClick(value)} />} 
                                              trigger={this.state.trigger}> 
                                        <i className="anticon anticon-message" onClick={ this.handleMessage} id={`M${item.id}`}/> 
                                     </Popover> : <i className="anticon anticon-message" style={{background: '#ddd'}}/>
                                     ]}>
                  <List.Item.Meta description={(item.indexnum === 2) ? <div style={{background: '#ddd'}}>回复：{(new Buffer(replylist[item.parid],'base64')).toString()} </div>: null}                
                  />
                  <span style = {{whiteSpace : 'normal' , wordBreak : 'break-all'}}>
                    {(new Buffer(item.comcontent,'base64')).toString()}
                  </span>
                </List.Item>
                </div>
              )}
            />
    );
  }
}

class Details extends Component {
    constructor(props){
    super(props);
		//console.log(this.props.location);
    if(this.props.location.state ){
      var data = this.props.location.state;
      var {idata , catename } = data;
      caname = catename;
      action = idata;
      window.sessionStorage.setItem('action',JSON.stringify(action));
      window.sessionStorage.setItem('caname',catename);
      //window.sessionStorage.setItem('idata',idata);
    }else{
      action = JSON.parse(window.sessionStorage.getItem('action'));
      caname = window.sessionStorage.getItem('caname');
    }
    this.state = {
      Comment: '',
      replyd: false,
      edtor: false,
      loading : true,
      artdetails : '',
      arttitle : '',
      voteable : false,
      votenumb : '投票数目，精确到四位小数，示例：1.0001',
    }
    this.editstyle ={
      height: '300px',
      border: '2px solid #F1F1F1'
    }
  }
    showVoteModal = (ev, auditor, catename) => {
    this.setState({
      voteable: true,
      curauditor: auditor,
      curcatename: catename,
    });
  };

  handleVoteFocus = (event) => {
    //console.log(e);
    this.setState({
      votenumb : (this.state.votenumb === '投票数目，精确到四位小数，示例：1.0001') ? '' : this.state.votenumb,
    });
  };
  handleVoteBlur = (event) => {
    //console.log(e);
    this.setState({
      votenumb : (this.state.votenumb === '') ? '投票数目，精确到四位小数，示例：1.0001' : this.state.votenumb,
    });
  };
  handleVoteCancel = (event) => {
    //console.log(e);
    this.setState({
      voteable: false,
    });
  };
  handleVoteNumChange = (event) => {
    let str = event.target.value.replace(/[^\.0-9]/g,'');
    console.log(str);
    this.setState({ votenumb: str });
    //this.setState({ votenumb: event.target.value });
  }
  handleVoteOk = (event) =>{
    if(window.sessionStorage.getItem('identity') ){
    let reg = /^[0-9]+(.[0-9]{1,4})?$/
    //signfun('code','voteart','self',parseInt(this.state.votenumb * 10000.0, 10),caname,action.id);
    if(reg.test(this.state.votenumb)){
      console.log(parseInt(this.state.votenumb * 10000.0, 10));
      //console.log();
      //signfun('code','voteart','self',parseInt(this.state.votenumb * 10000.0, 10),caname,action.id);
      this.setState({
        voteable: false,
      });
    }else{
      alert("数据输入错误");
      this.setState({
        votenumb : '投票数目，精确到四位小数，示例：1.0001',
      });
    }
  }else{
    alert("请登录scatter");
  }}
  handleVote = (event) =>{
    if(checkName()){
    this.setState({
      voteable: true,
      votenumb : '投票数目，精确到四位小数，示例：1.0001',
    });
    }else{scatterAlert()}
  }
  handleBlur = (event) =>{
    this.setState({
      edtor: false
    })
  }
  handleEdtor = (event) =>{
    if(checkName()){
    this.setState({
      edtor: true
    })
    }else{scatterAlert()}
  }
  handleComment = (event) =>{
    this.setState({
      Comment: event.target.value
    })
  }
  handleArtDelete = (event) =>{
    if(checkName()){
    signfun('code','deleteart','self',action.id,caname);
    this.props.history.push('/article');
    }else{scatterAlert()}
  }
//提交一级评论
  enterLoading = (event) => {
    if(this.state.Comment === '') {
      alert("kong");
    }else{
      this.setState({ replyd: false }); 
      const htmBase=(Buffer.from(this.state.Comment)).toString('base64');
      signfun('code','createcom','self',htmBase,caname,action.id,1);
      this.getFirstComm();
    }
    this.setState({ edtor: false });  
}
 getFirstComm () {
    this.setState({ replyd: false });
    replyFis = [];
      getTableRows({json:true,code:'code',scope: caname,table:'comments',key_type:'i64',index_position:'2',lower_bound:action.id,upper_bound:action.id + 1}).then(data => {
  	      try{
              data.rows.map((iterf) => {if (iterf.indexnum === 1) {replyFis.push(iterf)}});  //过滤二级评论
              let tmp = replyFis.length - 1;
              replySec = [];
              replylist = {};
              replyFis.map((iter,key) => {
                getTableRows({json:true,code:'code',scope: caname,table:'comments',key_type:'i64',index_position:'2',lower_bound:iter.id,upper_bound:iter.id + 1}).then(data => {
  	              try{		       
                      data.rows.map((iters) => {if (iters.indexnum === 2) {replySec.push(iters)}});  //过滤一级评论
                      replylist[iter.id] = iter.comcontent;
                      if(key === tmp){
                        replyFis = replyFis.concat(replySec);
                        this.setState({ replyd: true }); 
                      }
                     }catch(e){
		  	            console.log(e);
		              }});
              });
		          }catch(e){
		  	        console.log(e);
		        }});
  }

  componentDidMount() {
    // 数据异步请求，请求成功之后setState
    //console.log(action);
    get(action.arthash)
      .then(data => {
        this.setState({
          artdetails : (new Buffer(data.toString() , 'base64')).toString(),
          arttitle : (new Buffer(action.title,'base64')).toString()
        });
        //action = idata;
        this.getFirstComm(); 
        this.setState({
          loading : false,
          replyd : true,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    return (
      <div>
        {
          this.state.loading
          ? <Spin indicator={antIcon} />
          : <div>
          <Modal
                      title="文章投票"
                      visible={this.state.voteable}
                      onOk={this.handleVoteOk}
                      onCancel={this.handleVoteCancel}
                    >
                      <h4>数目</h4>
                      <Row>
                        <Col span={22}>
                          <Input
                            onKeyUp = {this.handleKeyUp}//value.replace(/[^\r\n0-9.]/g,'')}
                            onBlur={this.handleVoteBlur}
                            onFocus = {this.handleVoteFocus}
                            value={this.state.votenumb}
                            onChange={this.handleVoteNumChange}
                            //autosize = {{ minRows: 1, maxRows: 2 }}
                          />
                        </Col>
                        <Col span={2}>&nbsp;MZP</Col>
                      </Row>
                    </Modal>
              <h1 ><p style={{textAlign : 'center'}}>{this.state.arttitle}</p></h1>
              <span dangerouslySetInnerHTML={{__html: this.state.artdetails}} />
               <div><IconText type="user" text={action.author} />
                  <Divider type="vertical" />
                  <IconText type="like" text={action.votenum / 10000.0000 + ' MZP'} />
                  <Divider type="vertical" />
                  <IconText type="pay-circle" text={action.basetick / 10000.0000 + action.addtick/10000.0000 + ' MZP' } />
                  <Divider type="vertical" />
                  <IconText type="usr" text={timeString(action.timestamp)} />
               </div>
               <hr />
               <div>
                   <Row type="flex" justify="center">
                      <Col span={5}><Button onClick={ this.handleEdtor}>我有线索</Button></Col>
                      <Col span={5}><Button onClick={ this.handleVote}>我要投票</Button></Col>
                      <Col span={5}><Button onClick={ this.handleArtDelete}>我要删除</Button></Col>
                  </Row>
               </div><div>
               { this.state.edtor ? 
        <div style={{ margin: '24px 0' }}>         
          <Input.TextArea value={this.state.Comment} onChange={this.handleComment} autosize={{ minRows: 2, maxRows: 6 }} autoFocus={"autofocus"} onBlur={this.handleBlur}/>
          <Button  onClick={this.enterLoading.bind(this)} style={{ float:'right'}}>
            提交
          </Button>
        </div>: <hr />}</div>
              
        <h3>当前线索</h3>      
          {this.state.replyd ?  <Show /> : <Spin indicator={antIcon} />}
         </div>
        }

      </div>
      
    );
  }
}
export default Details;
