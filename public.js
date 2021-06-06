// 自定义 初始化方法
(function(_this) {

}(this))

// 定义说明===>>>
// _this为外部this (不可更改)
// this_为内部this (自定义)
const $v = function(_this) {
	try {
		if ($('')) {}
	} catch (e) {
		console.error('初始化失败,请先加载JQ!')
		return
	}
	try {
		var layer = layui.layer ? layui.layer : layer
	} catch (e) {
		console.error('初始化失败,请先加载layer!')
		return
	}

	// 全局自定义 挂载
	_this.$p = function() {
		this.add = function(name, val) {
			this[name] = val
		}
		this.del = function(name) {
			delete this[name]
		}
	}

	// 全局固定 挂载
	return {
		// 使用方法=>  可以挂载变量或方法  挂载变量时会全量替换值，不会在原有数据上增加
		// 本页面 挂载 方法1=>$p.prototype.name=function(){}  调用=>$v.$p.name()
		// 本页面 挂载 方法2=>$v.$p.add('name',function(){})  调用=>$v.$p.name()
		// 单个值全部删除 方法=>$v.$p.del('name')
		$p: new $p(),
		// 使用方法=>  可以挂载变量或方法  挂载Array或Object默认会在原有数据上增加
		// 跨页面 挂载 方法1=>$v.$pall.set('name',function(){}) 调用=>$v.$pall.get().name()
		// 跨页面 挂载 方法2=>$v.$pall.set('name',function(){}) 调用=>$v.$pall.set().name()
		// 单个值全部删除 方法=>$v.$pall.del('name')
		// 单个值单个删除 方法=>delete $v.$pall.get()[name]
		$pall: new function() {
			this.set = function(name, value, _window) {
				var cache = this.get(undefined, _window)
				if (typeof value == 'object' && value !== undefined) {
					let value_ = this.get(undefined, _window)[name] || undefined
					if (value_ != undefined) {
						if (value_.constructor === Array && value.constructor == Array) {
							value = $v.deepCopy(value_).concat($v.deepCopy(value))
						}
						if (value_.constructor === Object && value.constructor == Object) {
							value = Object.assign($v.deepCopy(value_), $v.deepCopy(value))
						}
					}
				}
				return value !== undefined ? cache[name] = value : cache
			}
			this.get = function(name, _window) {
				var top = _window !== undefined ? _window.top : window.top
				var cache = top ? (top['_CACHE'] || {}) : {}
				top ? top['_CACHE'] = cache : {}
				return name !== undefined && name !== '' ? cache[name] : cache
			}
			this.del = function(name, _window) {
				var cache = this.get(undefined, _window)
				if (cache && cache[name]) delete cache[name]
			}
		},
		request: function(action, type = 'GET', field = {}, errMsgBool = true, dataType = 'JSON',
			receiveType = 'JSON', Header = {}, defErrMsg = '请求失败', wait, timeout = 5000, dataToJsonStr = false
		) {
			// 认定请求成功时,返回[请求结果数据](单单数据内容)
			// 认定请求失败时,返回[整体请求结构](包含协议头，状态码等)
			// 同步使用async await
			// 异步使用then
			return new function() {
				let this_ = this
				// 请求地址
				this.action = action
				// 请求类型
				this.type = type
				// 携带数据
				this.field = field
				// 请求失败时是否提示信息
				this.errMsgBool = errMsgBool
				// 数据类型
				this.dataType = dataType
				// 接收数据类型
				this.receiveType = receiveType
				// 携带Header
				this.Header = Header
				// 请求失败时,返回数据找不到失败字段时,默认提示文本
				this.defErrMsg = defErrMsg
				// 是否请求中,显示等待弹框
				this.wait = wait
				// 超时时间
				this.timeout = timeout
				// 携带数据 是否转换Json字符串类型
				this.dataToJsonStr = dataToJsonStr

				// 统一默认配置
				this.config = {
					// 前缀地址
					baseUrl: 'https://www.gongjubaike.cn',
					// 固定数据 (只有dataType为json时会携带)
					data: {},
					// 固定协议头
					Header: {
						'content-type': 'application/json;charset=UTF-8',
					},
					// 请求开始 输出提示
					startlog: false,
					// 请求结束 输出提示
					endlog: false
				}

				// 每次请求前都会执行本方法
				this.start = function() {
					if (this.config.startlog) console.log('请求开始', this)
					
					// 自适应调试方法
					if(window.location.hostname.indexOf('localhost')!=-1)this.config.baseUrl='http://localhost:8080'
					if(window.location.hostname.indexOf('127.0.0.1')!=-1)this.config.baseUrl='http://localhost:8080'
				}
				// 每次请求结束都会执行本方法
				this.end = function(res) {
					if (this.config.startlog) console.log('请求结束', this, res)

					if (res.status == 200) {
						let data = dataToType(res.responseText)

						if (data.code == 0) return true;
						console.log(data)

						switch (parseInt(data.code)) {
							// case 999999999:
							// 	return false;
							// 	break;
							default:
								if (this.errMsgBool) layer.msg(data.msg ? data.msg : this
									.defErrMsg, {
										icon: 2,
										time: 2000
									})
						}

						return false
					} else {

						// switch (res.status) {
						// 	case 999999999:
						// 		return false;
						// 		break;
						// 	default:
						// }

					}

					// 公共区开始-------->>>>



					return false
				}
				this.send = function() {
					this.start()
					if (this.wait) var loading = layer.load(1, {
						shade: [0.1, '#fff'],
						time: this.timeout
					})
					let sendData = this.dataType.toLowerCase() == 'json' ? Object.assign(
						this.config.data, this.field) : this.field
					if (this.dataToJsonStr) sendData = JSON.stringify(sendData)
					return new Promise((resolve, reject) => {
						$.ajax({
							type: this.type,
							url: this.config.baseUrl + this.action,
							// contentType: 'application/json;charset=UTF-8',
							data: sendData,
							async: false,
							timeout: this.timeout,
							dataType: this.dataType,
							headers: this.config.Header,
							beforeSend: (XMLHttpRequest) => {
								for (let i in this.Header) {
									XMLHttpRequest.setRequestHeader(i, this
										.Header[i])
								}
							},
							success: (data, textStatus, xhr) => {
								if (this.end(xhr)) resolve(dataToType(xhr
									.responseText));
								else reject(xhr);
							},
							error: (xhr, textStatus) => {
								if (this.end(xhr)) resolve(dataToType(xhr
									.responseText));
								else reject(xhr);
							},
							complete: (xhr, textStatus) => {
								if (this.wait) layer.close(loading)
							}
						})
					});
				}
				// 数据解析 返回对象类型
				function dataToType(val) {
					try {
						switch (this_.receiveType.toLowerCase()) {
							case 'json':
								return JSON.parse(val)
								break
							case 'xml':
								return $v.xmlStrToJson(val)
								break
						}
					} catch (e) {

					}

					return {}
				}
				this.setType = function(val) {
					this.type = val
					return this
				}
				this.setErrMsgBool = function(val) {
					this.errMsgBool = val
					return this
				}
				this.setDataType = function(val) {
					this.dataType = val
					return this
				}
				this.setReceiveType = function(val) {
					this.receiveType = val
					return this
				}
				this.setHeader = function(val) {
					this.Header = val
					return this
				}
				this.setDefErrMsg = function(val) {
					this.defErrMsg = val
					return this
				}
				this.setWait = function(val) {
					this.wait = val
					return this
				}
				this.setTimeout = function(val) {
					this.timeout = val
					return this
				}
				this.setDataToJsonStr = function(val) {
					this.dataToJsonStr = val
					return this
				}
			}
		},
		GetArray: function(arr) {
			// Array类型 自方法
			return new function() {
				this.arr = JSON.parse(JSON.stringify(arr))

				// 查询指定内容且删除掉它
				this.indexOfSplice = function(val) {
					let index = this.arr.indexOf(val)
					// let index=-1
					// for (let i = 0; i < addlsit.length; i++) {
					// 	if(addlsit[i]==obj.data.title){
					// 		index=i
					// 		break
					// 	}
					// }
					if (index == -1) return this.arr
					else this.arr.splice(index, 1)
					return this
				}

				// 内置固定方法 开始区===>>>>  (放在底部,防止自定义挂载方法中有重复，不失效问题)
				this.get = function() {
					return this.arr
				}


			}
		},
		deepCopy: function(source) {
			// 深度克隆
			if (typeof source != "object") {
				return source;
			}
			if (source == null) {
				return source;
			}
			var newObj = source.constructor === Array ? [] : {};
			for (var i in source) {
				newObj[i] = $v.deepCopy(source[i]);
			}
			return newObj;
		},
		getUrlParam: function(variable) {
			// 从url获取值
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return pair[1];
				}
			}
			return (false);
		},
		print: function() {
			// 输出信息
			return new function() {
				// 阻止输出配置
				this.config = {
					logon: false,
					infoon: false,
					warnon: false,
					erroron: false
				}

				this.log = function(...val) {
					if (this.config.logon) return
					console.log(...val);
				}
				this.info = function(...val) {
					if (this.config.infoon) return
					console.info(...val);
				}
				this.warn = function(...val) {
					if (this.config.warnon) return
					console.warn(...val);
				}
				this.error = function(...val) {
					if (this.config.erroron) return
					console.error(...val);
				}
			}
		},
		xmlStrToXml: function(xmlStr) {
			// xml字符串转换xml对象数据
			var xmlObj = {};
			if (document.all) {
				var xmlDom = new ActiveXObject("Microsoft.XMLDOM");
				xmlDom.loadXML(xmlStr);
				xmlObj = xmlDom;
			} else {
				xmlObj = new DOMParser().parseFromString(xmlStr, "text/xml");
			}
			return xmlObj;
		},
		xmlStrToJson: function(xml) {
			// xml字符串转换json数据
			var xmlObj = $v.xmlStrToXml(xml);
			var jsonObj = {};
			if (xmlObj.childNodes.length > 0) {
				jsonObj = $v.xmlTojson(xmlObj);
			}
			return jsonObj;
		},
		xmlTojson: function(xml) {
			// xml转换json数据
			try {
				var obj = {};
				if (xml.children.length > 0) {
					for (var i = 0; i < xml.children.length; i++) {
						var item = xml.children.item(i);
						var nodeName = item.nodeName;
						if (typeof(obj[nodeName]) == "undefined") {
							obj[nodeName] = $v.xmlTojson(item);
						} else {
							if (typeof(obj[nodeName].push) == "undefined") {
								var old = obj[nodeName];
								obj[nodeName] = [];
								obj[nodeName].push(old);
							}
							obj[nodeName].push($v.xmlTojson(item));
						}
					}
				} else {
					obj = xml.textContent;
				}
				return obj;
			} catch (e) {
				// console.log(e.message);
				return {}
			}
		}
	}
}(this)
