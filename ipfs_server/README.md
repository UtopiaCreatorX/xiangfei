# ipfs服务器配置以及调用方式

### 概述

对于一个成熟的DAPP来讲，大文件存储是至关重要的。当前市面上的公有链，均是采用数据库的方式来保存哈希值等摘要信息，遇到大文件存储便无能为力了。为此，我们需要寻找一个方案来解决大文件存储的问题。幸运的是，星际文件系统(IPFS)为此已经做了大量的工作，但是由于IPFS公共测试网，对于国内用户不友好，体验较差，所以我们可以搭建自己的私有网络来存储文件。（Ps：busy.org网站所用的图片存储便是ipfs存储）

### 示例

使用curl工具上传文件，返回哈希值结果：

```shell
curl -F file=@/Users/mooninwater/Downloads/壁纸.jpg "http://119.28.52.50:5001/api/v0/add"
{"Name":"壁纸.jpg","Hash":"QmUeotPP86zMWnzF7bhDp8VaQtA9kjdZpGbr2hVnSjGxqB","Size":"366747"}
```

通过网关访问上传的数据：http://119.28.52.50:8080/ipfs/QmUeotPP86zMWnzF7bhDp8VaQtA9kjdZpGbr2hVnSjGxqB

### 目标

1、学会如何搭建自己的IPFS私有网络。
2、编写网页端代码与私有IPFS网络通信（上传文件、下载文件）

### 详解

###### 一、搭建自己的IPFS私有网络

**第一步：准备固定ip的主机，用来搭建ipfs私有网络**
为了实现这个功能，需要准备几台固定IP的机器。笔者在vultr官网购买了三台vps主机，来完成实验。（Ps:vps主机相对国内一些云服务器厂商要便宜一些），笔者的三台机器信息如下：

> /ip4/66.42.54.83/tcp/4001/ipfs/QmZaP72EVrzYX4r4hDaNEWUdGw4rzyNgNAeUbNsT3u9R4v
> /ip4/45.77.17.31/tcp/4001/ipfs/QmP1eA6L7qzhEE2qrr3gGjcWBerndu7AjUe1G62bHeyELa
> /ip4/66.42.32.86/tcp/4001/ipfs/QmQ7CHfodyUqq31MuecDy4RAgUWCcG96qwLTqJEjh9TZbs

**第二步：下载安装ipfs，并进行初始化**
根据自己的系统版本，下载ipfs安装包[https://dist.ipfs.io/#go-ipfs](https://dist.ipfs.io/#go-ipfs)。
笔者的vps主机系统为ubuntu16.04，安装步骤如下：

> tar xvfz *go-ipfs_v0.4.15_linux-amd64.tar.gz* （你下载的压缩包名称）
> cd go-ipfs
> ./install.sh

安装完成后，执行ipfs命令可以看到如下信息：
![image.png](https://ipfs.busy.org/ipfs/QmSPDb7pazvCJjBGCkKpbtqrzBvVGhataQzVvdZBhdbQkm)

初始化ipfs，生成.ipfs文件夹，在ubuntu系统的~目录下，执行ls -a命令可以查看到。

> root@vultr:~#ipfs init (初始化ipfs命令)
> root@vultr:~# ls -a
> . .. .bash_history .bashrc .cache go-ipfs go-ipfs_v0.4.15_linux-amd64.tar.gz **.ipfs** .profile

**第三步：生成swarm.key**
多台机器构建出一个私有网络，那么该私有网络下的所有机器就需要共用一个swarm.key文件。文件的生成方式如下：（测试环境：MacOs, 并安装了go）
swarm.key文件生成工具地址[https://github.com/Kubuxu/go-ipfs-swarm-key-gen/tree/master/ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen/tree/master/ipfs-swarm-key-gen)，在该地址下载main.go
使用方法：

> go run main.go > ~/swarm.key

**第四步：添加引导节点信息，并导入swarm.key**
4.1 ipfs默认安装之后，会连接公网的启动节点。我们在构建自己的私有网络之前，需要删除默认的引导节点信息，执行命令：

> ipfs bootstrap rm —all

4.2 将第三步中生成的swarm.key，上传到.ipfs目录下。
4.3 启动ipfs私有网络，执行命令：

> ipfs daemon

4.4 启动ipfs网络之后，这些节点由于没有引导信息，类似于一个个的孤岛，我们需要把他们连接起来。
查看节点的id信息，在任意一台机器执行命令，红线标识的即为该节点的引导信息：

> ipfs id

![image.png](https://ipfs.busy.org/ipfs/QmdWK1zqwx5MnAcihUMztcjgaRCdUTxnjggiy9S9mJaM4v)

复制该节点的引导信息，在其他节点执行如下命令，将该引导信息添加到其他节点：

> ipfs bootstrap add /ip4/66.42.32.86/tcp/4001/ipfs/QmQ7CHfodyUqq31MuecDy4RAgUWCcG96qwLTqJEjh9TZbs（换成你自己的节点ID）

稍等片刻，通过如下命令，可以看到几台机器已经在同一个私有集群下面了：

> ipfs swarm peers

![image.png](https://ipfs.busy.org/ipfs/QmQMYVDN1Nh7RNbHVx9FVrhMEEAkZx3YXhyhWmjjj1ak3P)

如此，搭建一个属于自己的ipfs私有网络便完成了。如果你感兴趣，可以连接上我的私有网络，我把我自己的swarm.key和引导信息提供给你。(相关信息在文末)

###### 二、编写网页端与自己的ipfs私有网络通信

这便是我写的一个简单网页webpage，只写了上传文件和下载文件功能。相关代码我也放在文末。
![image.png](https://ipfs.busy.org/ipfs/QmQmB5gXXL3kRTze7E6jiq1cGiijkEC98BaVKGTVnBbsk4)

当我们有了一个私有网络的时候，我们并不满足在本地调用ipfs接口上传下载文件。我们需要在其他机器上调用这些接口，ipfs提供给了相关的http api和参数，我们可以自己去调用。当我们启动ipfs的时候，会看到默认的监听ip和端口为/ip4/127.0.0.1/tcp/5001。为了能够让其他机器调用，我们需要修改配置为我们的公网ip
![image.png](https://ipfs.busy.org/ipfs/QmNooXtr7MXh79kSj8UznwfpkDDfjtY9AXVPjBJbx7x6HY)

修改.ipfs里面config配置文件，或者执行命令进行修改：

> ipfs config --json Addresses.API '["/ip4/66.42.54.83/tcp/5001"]' 换成你的公网ip，之后便可以通过远程http接口来调用API了。（Ps：其中66.42.54.83:5001为我的vps主机开放的公共API接口）

**上传文件**：调用/api/v0/add接口。（Ps：该接口为post方式调用，需要上传文件的数据存放在body里面，使用formdata方式上传），相关代码如下：

> var formdata=new FormData();
> formdata.append("file",document.getElementById("upfile").files[0],document.getElementById("upfile").files[0].name);
> xmlhttp.open("POST","[http://66.42.54.83:5001/api/v0/add](https://busy.org/exit?url=http%3A%2F%2F66.42.54.83%3A5001%2Fapi%2Fv0%2Fadd)",true);
> xmlhttp.send(formdata);

**下载文件**：调用api/v0/cat接口。（笔者调用get接口，下载下来的数据包含了部分无用数据，具体原因没有排查清楚，只能换种方式来下载）

> xmlhttp.open("GET","[http://66.42.54.83:5001/api/v0/cat?arg=](https://busy.org/exit?url=http%3A%2F%2F66.42.54.83%3A5001%2Fapi%2Fv0%2Fcat%3Farg%3D)"+hash,true);
> xmlhttp.send();

以上便是使用网页与自己搭建的ipfs私有网络交互的全部内容了，如果读者有什么问题，欢迎和笔者交流。由于笔者的交互文件写的很简单，想深入了解的读者，可以去github上搜索ipfs-api库，已经有js版本、python版本等可以学习。

参考链接： [http://ipfser.org/2018/03/31/r35/](http://ipfser.org/2018/03/31/r35/)

