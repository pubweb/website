---
date: 2017-05-04
title: '自动化生成代码的秘密'
template: post
thumbnail: '../thumbnails/profile.png'
slug: auto-generate-code
author: JayL
categories:
  - go
  - microservice
  - Popular
tags:
  - golang
  - go
  - code generate
  - orm
  - 代码生成
---

我做过两个自动化生成代码的项目，[scaffold](https://github.com/liujianping/scaffold)和[redis-orm](https://github.com/ezbuy/redis-orm)。
**[scaffold](https://github.com/liujianping/scaffold)** 主要是通过数据库表定义来生成基于表的增删改查的基础管理工作；
**[redis-orm](https://github.com/ezbuy/redis-orm)** 是通过yaml的结构定义文件生成关系型数据库与redis的常规操作实现。
公司里还有一套微服务的自动化生成框架，能够快速的通过[protobuf](https://developers.google.com/protocol-buffers/docs/overview)的定义文件生成项目的框架代码。

自动化生成代码有个最大的优点：**减少程式化的编码**。所谓程式化的编码就是，通常这些编码的工作量会随着业务量的增长线性增长，同时又是最没有技术含量的工作。所以通过开发自动化生成工具非常有必要，减少无谓的工作量同时大大提升工作效率，把大家解放出来做更有意义的事。

不论是我写的自动化生成工具或是公司的微服务框架生成工具还是其它一些官方工具，都有一个共同原理，所谓**自动化生成代码的秘密**，即

> **通过结构化的元数据生成模式代码**

这句话中有两个关键词：
- **结构化的元数据**
  结构化的元数据的来源可以是：
  -  数据表定义
     例子： [scaffold](https://github.com/liujianping/scaffold)
  -  结构化的配置文件(yaml, toml 等等)
     例子： [redis-orm](https://github.com/ezbuy/redis-orm)
  -  服务接口定义(Thrift, ProtoBuffer等等)
     例子：[grpc](https://grpc.io)、[micro](https://github.com/micro)
  -  程序代码中的类型、对象、接口等等
     例子：[stringer](https://godoc.org/golang.org/x/tools/cmd/stringer)、[mock](https://github.com/golang/mock)

- **模式代码**
  模式代码，即所有生成的代码是符合一定**规律**的，而这种**规律**就是基于元数据而言的。

## 1. 最简单的例子

官方的工具[stringer]()就是一个自动化生成代码工具，主要用途是**通过枚举值的变量名生成String函数接口**，常用场景就是在定义程序状态码中使用。其中，**结构化的元数据**就是枚举类型的定义。

````go
package codes

type Code uint32

//go:generate stringer -type=Code

const (
  OK Code = 0
  Canceled Code = 1
  Unknown Code = 2
  InvalidArgument Code = 3
）
````
这是一个简化版的GRPC状态码的例子，在文件所属目录下通过以下stringer命令即可生成代码文件*code_string.go*。
````shell
$: stringer -type Code
````
生成的代码如下：
````go
// Code generated by "stringer -type Code"; DO NOT EDIT

package codes

import "fmt"

const _Code_name = "OKCanceledUnknownInvalidArgument"

var _Code_index = [...]uint8{0, 2, 10, 17, 32}

func (i Code) String() string {
	if i >= Code(len(_Code_index)-1) {
		return fmt.Sprintf("Code(%d)", i)
	}
	return _Code_name[_Code_index[i]:_Code_index[i+1]]
}
````
原代码函数有一句注释的语句：
````
//go:generate stringer -type=Code
````
通过该语句，可以在命令行中执行如下命令，效果相同：
````
$: go generate
````
一个小技巧，在制作自动化生成代码工具的过程中有时候会很有用。

## 2. 微服务框架的自动化

微服务现在很火，如何开发一个**微服务框架的自动化生成工具**呢？

首先，我们要清楚什么是**框架**？

> 框架是对接口的抽象

这是我个人对框架的总结，通过将项目中变化的部分通过接口抽象出来，提供给开发者，将不变的或者配置可变的放入框架中。

其实，[grpc](http://www.grpc.io/) 已经是一个简单的微服务框架了，只是功能比较单一，仅仅通过[protobuf](https://developers.google.com/protocol-buffers/)的定义生成客户端与服务端代码框架。它是怎么做到的？

管道的概念，做服务端的人都非常熟悉。可以用管道的概念类比一下[grpc](http://www.grpc.io/)框架代码的**生成过程**。

> protoc  |  protoc-gen-go  |  plugin:grpc

protoc编译器通过读取[protobuf](https://developers.google.com/protocol-buffers/)协议与接口配置，输出结构化元数据给 protoc-gen-go，由它生成 go 代码，在protoc-gen-go中会用到 plugin:grpc 的插件实现grpc框架代码的定制生成。

当然， protoc-gen-go 调用 plugin:grpc 不是通过管道的方式。

要实现**微服务框架的自动化**的关键全在 plugin:grpc 中了。因为 plugin:grpc 就是一个代码生成器。你想要的所有**内心戏**全部可以在这里实现。包括：

- 服务发现
- 上下文定制
- 错误处理
- 日志
- 统计

全部可以在框架里实现，仅仅暴露简单的接口供开发人员开发。

为了让**生成代码**更加精炼、可读性更强，共用的一些函数都会通过**公用包**的形式实现。

在安装GRPC的过程中，有这样一条安装命令：

````shell
$: go get -u github.com/golang/protobuf/{proto,protoc-gen-go}
````
其中，包[proto](https://github.com/golang/protobuf/tree/master/proto)就是protoc生成go代码提供的**公用包**。

** 结构化元数据 **

有时候阅读代码可以帮助我们理解protobuf协议。在公司的微服务框架里用到了[custom option](https://developers.google.com/protocol-buffers/docs/proto#customoptions). 在官方文档说，这个属性对于大部分开发者都是不会用到的。因为这个属性仅有在需要开发自己的框架代码时才会使用到。编写**模式代码**中，可以通过**custom option**控制框架代码的生成。

** 模式代码 **

除了结构化的元数据，**模式代码**的质量直接影响了项目本身的质量。模式代码保持精炼，可读性强都是一些基本要求。不贴代码了，具体代码参见[grpc.go](https://github.com/golang/protobuf/blob/master/protoc-gen-go/grpc/grpc.go).

如何编写自己的Plugin，除了参考GRPC本身的Plugin实现，还可以参考这个项目
[micro/protobuf](https://github.com/micro/protobuf).

## 3. 自动化生成代码常见的坑

在开发**自动化生成代码工具**的过程中，关键一步是编写**模式代码**。通常**模式代码**一定是通过不断的迭代才能达到*所谓的完美*。所以，在不断迭代的过程中，就会出现，很痛苦的，**改变接口**。

如果只是生成的代码**改变接口**可能影响面还比较小，只需要相应的修改调用方代码即可。但是如果生成代码中调用的**公用包**接口发生改变了，可能以前生成的代码就会发生故障。这也是我真实碰到过的一个坑。为了防止类似错误，可以通过**版本控制**的办法解决。

通过对仓库打tag，利用[gopkg.io](http://labix.org/gopkg.in)实现版本控制，是非常快捷且高效的解决办法.

## 4. 如何用好自动化代码生成工具

用好自动化代码生成工具的关键，除了对生成代码本身要很熟悉外，还需要了解生成工具编写的**模式代码**。了解自动化代码生成工具的原理是非常必要的。

其实框架越强大，对于业务而言越有利，但对喜欢*偷懒*的程序员而言是不利的。所以利用*偷懒*来的时间，阅读框架代码非常必要。

归根结底，自动化编程是一项泛化编程技术，以前在c++中是件高端而隐秘的事，将程序执行期的代码移至编译期生成。如今，在go语言中，可以通过模板包[template](https://golang.org/pkg/text/template/)光明正大的干这件事了。

以上，就是我在开发和使用自动化代码生成工具中学到的些许经验，全当抛砖引玉，欢迎指教。

