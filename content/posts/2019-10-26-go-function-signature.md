---
date: 2019-10-26
title: 'Go 编程：记一次函数定义的争论'
template: post
thumbnail: '../thumbnails/go.png'
slug: go-function-signature
author: JayL
categories:
  - go
tags:
  - interface
  - go
  - golang
  - Go 编程
---

最近和同事讨论开发通用(基础)包的事，讨论半天，口干舌燥，似乎也没有成功的将个人理念安利出去。只得将这些“自以为是”的东西写下来，供读者参考。

为了减少重复代码和提升代码的维护性，通常需要将此类功能代码提炼出来，作为一个**通用(基础)包**加以实现。既然是一个**通用(基础)包**，就必须定义一套通用函数，方便大家使用。那么，如何定义这些函数就是成了本次争论的焦点。

# 函数定义上的分歧

以本次争论的例子来说明：

> 提供一个通用包，封装`redis`库的队列功能。

在函数定义上我们出现严重分歧.

我的函数定义：

````go

func New(opts ...ClientOpt) *Client
````

他的函数定义：

````go
func New(config redis.Option) *Client
````

在创建客户对象的参数上，我认为需要具体的将配置通过`ClientOpt`选项的方式，一个个具体定义出来。他则认为，可以直接传递`redis.Option`选项。他的理由很简单：

- 这样直接使用`redis.Option`选项配置可以更加灵活
- 在基础包的实现代码上也简单，没必须每加一个配置就增加一个`ClientOpt`定义

我反驳他的理由如下：

- 直接使用`redis.Option`的话，那么使用上，还必须引用`redis`包。这样在我看来就打破了代码组织上的分层原则。
- 直接使用`redis.Option`配置，看似灵活，其实增加了使用者误用风险。之所以需要在`redis`包基础上再封装一层就是需要尽量减少使用者出错的可能性。如果需要灵活的话，完全使用`redis`包就可以了，根本没必要做进一步的封装。

他再反驳我：

- 使用`ClientOpt`选项配置，主次不清，使用者是并不知道什么是必选，什么是可选。

针对他的这个指控，我是接受的，重新修改了一下函数签名, 如下：

````go
//address 作为必选参数，直接显示的进行定义
//options 可选参数
func New(address string, options ...ClientOpt) *Client
````

这样定义之后，我想就可以说服对方了，结果还是高估了自己的说服能力。现在写下来，也许更具有说服力一点。
