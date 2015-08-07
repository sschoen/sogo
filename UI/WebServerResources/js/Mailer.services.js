!function(){"use strict";function Account(futureAccountData){"function"!=typeof futureAccountData.then&&(angular.extend(this,futureAccountData),_.each(this.identities,function(identity){identity.fullName?identity.full=identity.fullName+" <"+identity.email+">":identity.full="<"+identity.email+">"}),Account.$log.debug("Account: "+JSON.stringify(futureAccountData,void 0,2)))}Account.$factory=["$q","$timeout","$log","sgSettings","Resource","Mailbox","Message",function($q,$timeout,$log,Settings,Resource,Mailbox,Message){return angular.extend(Account,{$q:$q,$timeout:$timeout,$log:$log,$$resource:new Resource(Settings.baseURL(),Settings.activeUser()),$Mailbox:Mailbox,$Message:Message}),Account}];try{angular.module("SOGo.MailerUI")}catch(e){angular.module("SOGo.MailerUI",["SOGo.Common"])}angular.module("SOGo.MailerUI").factory("Account",Account.$factory),Account.$findAll=function(data){var collection=[];return data&&angular.forEach(data,function(o,i){o.id=i,collection[i]=new Account(o)}),collection},Account.prototype.$getMailboxes=function(options){var _this=this,deferred=Account.$q.defer();return!this.$mailboxes||options&&options.reload?Account.$Mailbox.$find(this).then(function(data){_this.$mailboxes=data,_this.$flattenMailboxes({reload:!0}),deferred.resolve(_this.$mailboxes)}):deferred.resolve(this.$mailboxes),deferred.promise},Account.prototype.$flattenMailboxes=function(options){var _this=this,allMailboxes=[],_visit=function(mailboxes){_.each(mailboxes,function(o){allMailboxes.push(o),o.children&&o.children.length>0&&_visit(o.children)})};return!this.$$flattenMailboxes||options&&options.reload?(_visit(this.$mailboxes),_this.$$flattenMailboxes=allMailboxes):allMailboxes=this.$$flattenMailboxes,allMailboxes},Account.prototype.$getMailboxByType=function(type){var mailbox,_find=function(mailboxes){var mailbox=_.find(mailboxes,function(o){return o.type==type});return mailbox||angular.forEach(mailboxes,function(o){!mailbox&&o.children&&o.children.length>0&&(mailbox=_find(o.children))}),mailbox};mailbox=_find(this.$mailboxes),console.debug(mailbox),console.debug(this.specialMailboxes)},Account.prototype.$getMailboxByPath=function(path){var mailbox=null,_find=function(mailboxes){var mailbox=_.find(mailboxes,function(o){return o.path==path});return mailbox||angular.forEach(mailboxes,function(o){!mailbox&&o.children&&o.children.length>0&&(mailbox=_find(o.children))}),mailbox};return mailbox=_find(this.$mailboxes)},Account.prototype.$newMailbox=function(path,name){var _this=this,deferred=Account.$q.defer();return Account.$$resource.post(path,"createFolder",{name:name}).then(function(){_this.$getMailboxes({reload:!0}),deferred.resolve()},function(response){deferred.reject(response.error)}),deferred.promise},Account.prototype.$newMessage=function(){var _this=this;return Account.$$resource.fetch(this.id.toString(),"compose").then(function(data){Account.$log.debug("New message: "+JSON.stringify(data,void 0,2));var message=new Account.$Message(data.accountId,_this.$getMailboxByPath(data.mailboxPath),data);return message}).then(function(message){return Account.$$resource.fetch(message.$absolutePath({asDraft:!0}),"edit").then(function(data){return Account.$log.debug("New message: "+JSON.stringify(data,void 0,2)),angular.extend(message.editable,data),message})})},Account.prototype.$addDelegate=function(user){var _this=this,deferred=Account.$q.defer(),param={uid:user.uid};return!user.uid||_.indexOf(_.pluck(this.delegates,"uid"),user.uid)>-1?deferred.resolve():Account.$$resource.fetch(this.id.toString(),"addDelegate",param).then(function(){_this.delegates.push(user),deferred.resolve(_this.users)},function(data,status){deferred.reject(l("An error occured please try again."))}),deferred.promise},Account.prototype.$removeDelegate=function(uid){var _this=this,param={uid:uid};return Account.$$resource.fetch(this.id.toString(),"removeDelegate",param).then(function(){var i=_.indexOf(_.pluck(_this.delegates,"uid"),uid);i>=0&&_this.delegates.splice(i,1)})}}(),function(){"use strict";function Mailbox(account,futureMailboxData){if(this.$account=account,"function"!=typeof futureMailboxData.then){if(this.init(futureMailboxData),this.name&&!this.path){var newMailboxData=Mailbox.$$resource.create("createFolder",this.name);this.$unwrap(newMailboxData)}}else this.$unwrap(futureMailboxData)}Mailbox.$factory=["$q","$timeout","$log","sgSettings","Resource","Message","Acl","Preferences","sgMailbox_PRELOAD",function($q,$timeout,$log,Settings,Resource,Message,Acl,Preferences,PRELOAD){return angular.extend(Mailbox,{$q:$q,$timeout:$timeout,$log:$log,$$resource:new Resource(Settings.activeUser("folderURL")+"Mail",Settings.activeUser()),$Message:Message,$$Acl:Acl,$Preferences:Preferences,$query:{sort:"date",asc:0},selectedFolder:null,$refreshTimeout:null,PRELOAD:PRELOAD}),Preferences.ready().then(function(){Preferences.settings.Mail.SortingState&&(Mailbox.$query.sort=Preferences.settings.Mail.SortingState[0],Mailbox.$query.asc=parseInt(Preferences.settings.Mail.SortingState[1]))}),Mailbox}];try{angular.module("SOGo.MailerUI")}catch(e){angular.module("SOGo.MailerUI",["SOGo.Common"])}angular.module("SOGo.MailerUI").constant("sgMailbox_PRELOAD",{LOOKAHEAD:50,SIZE:100}).factory("Mailbox",Mailbox.$factory),Mailbox.$find=function(account){var futureMailboxData;return futureMailboxData=this.$$resource.fetch(account.id.toString(),"view"),Mailbox.$unwrapCollection(account,futureMailboxData)},Mailbox.$unwrapCollection=function(account,futureMailboxData){var collection=[],createMailboxes=function(level,mailbox){for(var i=0;i<mailbox.children.length;i++)mailbox.children[i].level=level,mailbox.children[i]=new Mailbox(account,mailbox.children[i]),createMailboxes(level+1,mailbox.children[i])};return futureMailboxData.then(function(data){return Mailbox.$timeout(function(){return angular.forEach(data.mailboxes,function(data,index){data.level=0;var mailbox=new Mailbox(account,data);createMailboxes(1,mailbox),collection.push(mailbox)}),collection})})},Mailbox.$absolutePath=function(accountId,mailboxPath){var path=[];return mailboxPath&&(path=_.map(mailboxPath.split("/"),function(component){return"folder"+component.asCSSIdentifier()})),path.splice(0,0,accountId),path.join("/")},Mailbox.prototype.init=function(data){this.$isLoading=!1,this.$messages=[],this.uidsMap={},angular.extend(this,data),this.path&&(this.id=this.$id(),this.$acl=new Mailbox.$$Acl("Mail/"+this.id)),this.type&&(this.$isEditable=this.isEditable()),angular.isUndefined(this.$shadowData)&&(this.$shadowData=this.$omit())},Mailbox.prototype.$id=function(){return Mailbox.$absolutePath(this.$account.id,this.path)},Mailbox.prototype.$selectedCount=function(){var count;return count=0,this.$messages&&(count=_.filter(this.$messages,function(message){return message.selected}).length),count},Mailbox.prototype.$filter=function(sortingAttributes,filters){var _this=this,options={};return angular.isDefined(this.unseenCount)||(this.unseenCount=0),this.$isLoading=!0,Mailbox.$Preferences.ready().then(function(){Mailbox.$refreshTimeout&&Mailbox.$timeout.cancel(Mailbox.$refreshTimeout),sortingAttributes&&angular.extend(Mailbox.$query,sortingAttributes),angular.extend(options,{sortingAttributes:Mailbox.$query}),angular.isDefined(filters)&&(options.filters=_.reject(filters,function(filter){return angular.isUndefined(filter.searchInput)||0===filter.searchInput.length}),_.each(options.filters,function(filter){var secondFilter,match=filter.searchBy.match(/(\w+)_or_(\w+)/);match&&(options.sortingAttributes.match="OR",filter.searchBy=match[1],secondFilter=angular.copy(filter),secondFilter.searchBy=match[2],options.filters.push(secondFilter))}));var refreshViewCheck=Mailbox.$Preferences.defaults.SOGoRefreshViewCheck;if(refreshViewCheck&&"manually"!=refreshViewCheck){var f=angular.bind(_this,Mailbox.prototype.$filter);Mailbox.$refreshTimeout=Mailbox.$timeout(f,1e3*refreshViewCheck.timeInterval())}var futureMailboxData=Mailbox.$$resource.post(_this.id,"view",options);return _this.$unwrap(futureMailboxData)})},Mailbox.prototype.$loadMessage=function(messageId){var endIndex,uids,futureHeadersData,startIndex=this.uidsMap[messageId],max=this.$messages.length,loaded=!1;if(angular.isDefined(this.uidsMap[messageId])&&startIndex<this.$messages.length&&(angular.isDefined(this.$messages[startIndex].subject)&&(loaded=!0),endIndex=Math.min(startIndex+Mailbox.PRELOAD.LOOKAHEAD,max-1),!angular.isDefined(this.$messages[endIndex].subject)&&!angular.isDefined(this.$messages[endIndex].loading))){for(endIndex=Math.min(startIndex+Mailbox.PRELOAD.SIZE,max),uids=[];endIndex>startIndex&&max>startIndex;startIndex++)angular.isDefined(this.$messages[startIndex].subject)||this.$messages[startIndex].loading?endIndex++:(uids.push(this.$messages[startIndex].uid),this.$messages[startIndex].loading=!0);Mailbox.$log.debug("Loading UIDs "+uids.join(" ")),futureHeadersData=Mailbox.$$resource.post(this.id,"headers",{uids:uids}),this.$unwrapHeaders(futureHeadersData)}return loaded},Mailbox.prototype.isEditable=function(){return"folder"==this.type},Mailbox.prototype.$rename=function(){var findParent,parent,children,i,_this=this,deferred=Mailbox.$q.defer();return this.name==this.$shadowData.name?(deferred.resolve(),deferred.promise):(findParent=function(parent,children){var parentMailbox=null,mailbox=_.find(children,function(o){return o.path==_this.path});return mailbox?parentMailbox=parent:angular.forEach(children,function(o){!parentMailbox&&o.children&&o.children.length>0&&(parentMailbox=findParent(o,o.children))}),parentMailbox},parent=findParent(null,this.$account.$mailboxes),children=null===parent?this.$account.$mailboxes:parent.children,i=_.indexOf(_.pluck(children,"id"),this.id),this.$save().then(function(data){var sibling;angular.extend(_this,data),_this.id=_this.$id(),children.splice(i,1),sibling=_.find(children,function(o){return Mailbox.$log.debug(o.name+" ? "+_this.name),"folder"==o.type&&o.name.localeCompare(_this.name)>0}),i=sibling?_.indexOf(_.pluck(children,"id"),sibling.id):children.length,children.splice(i,0,_this),deferred.resolve()},function(data){deferred.reject(data)}),deferred.promise)},Mailbox.prototype.$compact=function(){return Mailbox.$$resource.post(this.id,"expunge")},Mailbox.prototype.$setFolderAs=function(type){return Mailbox.$$resource.post(this.id,"setAs"+type+"Folder")},Mailbox.prototype.$emptyTrash=function(){return Mailbox.$$resource.post(this.id,"emptyTrash")},Mailbox.prototype.$markAsRead=function(){return Mailbox.$$resource.post(this.id,"markRead")},Mailbox.prototype.$delete=function(){var promise,_this=this,deferred=Mailbox.$q.defer();return promise=Mailbox.$$resource.remove(this.id),promise.then(function(){_this.$account.$getMailboxes({reload:!0}),deferred.resolve(!0)},function(data,status){deferred.reject(data)}),deferred.promise},Mailbox.prototype.$deleteMessages=function(uids){return Mailbox.$$resource.post(this.id,"batchDelete",{uids:uids})},Mailbox.prototype.$copyMessages=function(uids,folder){return Mailbox.$$resource.post(this.id,"copyMessages",{uids:uids,folder:folder})},Mailbox.prototype.$moveMessages=function(uids,folder){return Mailbox.$$resource.post(this.id,"moveMessages",{uids:uids,folder:folder})},Mailbox.prototype.$reset=function(){var _this=this;angular.forEach(this,function(value,key){"constructor"!=key&&"children"!=key&&"$"!=key[0]&&delete _this[key]}),angular.extend(this,this.$shadowData),this.$shadowData=this.$omit()},Mailbox.prototype.$save=function(){var _this=this;return Mailbox.$$resource.save(this.id,this.$omit()).then(function(data){return _this.$shadowData=_this.$omit(),Mailbox.$log.debug(JSON.stringify(data,void 0,2)),data},function(data){Mailbox.$log.error(JSON.stringify(data,void 0,2)),_this.$reset()})},Mailbox.prototype.$newMailbox=function(path,name){return this.$account.$newMailbox(path,name)},Mailbox.prototype.$omit=function(){var mailbox={};return angular.forEach(this,function(value,key){"constructor"!=key&&"children"!=key&&"$"!=key[0]&&(mailbox[key]=value)}),mailbox},Mailbox.prototype.$unwrap=function(futureMailboxData){var _this=this,deferred=Mailbox.$q.defer();return this.$futureMailboxData=futureMailboxData,this.$futureMailboxData.then(function(data){Mailbox.$timeout(function(){var uids,headers;_this.init(data),_this.uids&&(Mailbox.$log.debug("unwrapping "+data.uids.length+" messages"),headers=_.invoke(_this.headers[0],"toLowerCase"),_this.headers.splice(0,1),_this.threaded&&(uids=_this.uids[0],_this.uids.splice(0,1)),_.reduce(_this.uids,function(msgs,msg,i){var data;return data=_this.threaded?_.object(uids,msg):{uid:msg.toString()},_this.uidsMap[data.uid]=i,msgs.push(new Mailbox.$Message(_this.$account.id,_this,data)),msgs},_this.$messages),_.each(_this.headers,function(data){var msg=_.object(headers,data),i=_this.uidsMap[msg.uid.toString()];_.extend(_this.$messages[i],msg)})),Mailbox.$log.debug("mailbox "+_this.id+" ready"),_this.$isLoading=!1,deferred.resolve(_this.$messages)})},function(data){angular.extend(_this,data),_this.isError=!0,deferred.reject()}),deferred.promise},Mailbox.prototype.$unwrapHeaders=function(futureHeadersData){var _this=this;futureHeadersData.then(function(data){Mailbox.$timeout(function(){var headers,j;data.length>0&&(headers=_.invoke(data[0],"toLowerCase"),data.splice(0,1),_.each(data,function(messageHeaders){messageHeaders=_.object(headers,messageHeaders),j=_this.uidsMap[messageHeaders.uid.toString()],angular.isDefined(j)&&_.extend(_this.$messages[j],messageHeaders)}))})})}}(),function(){"use strict";function Message(accountId,mailbox,futureMessageData){this.accountId=accountId,this.$mailbox=mailbox,this.$hasUnsafeContent=!1,this.$loadUnsafeContent=!1,this.editable={to:[],cc:[],bcc:[]},"function"!=typeof futureMessageData.then?(angular.extend(this,futureMessageData),this.id=this.$absolutePath(),this.$formatFullAddresses()):this.$unwrap(futureMessageData),this.selected=!1}Message.$factory=["$q","$timeout","$log","$sce","sgSettings","Gravatar","Resource","Preferences",function($q,$timeout,$log,$sce,Settings,Gravatar,Resource,Preferences){return angular.extend(Message,{$q:$q,$timeout:$timeout,$log:$log,$sce:$sce,$gravatar:Gravatar,$$resource:new Resource(Settings.activeUser("folderURL")+"Mail",Settings.activeUser())}),Preferences.ready().then(function(){Preferences.defaults.SOGoMailLabelsColors&&(Message.$tags=Preferences.defaults.SOGoMailLabelsColors)}),Message}];try{angular.module("SOGo.MailerUI")}catch(e){angular.module("SOGo.MailerUI",["SOGo.Common"])}angular.module("SOGo.MailerUI").factory("Message",Message.$factory),Message.filterTags=function(query){var re=new RegExp(query,"i");return _.filter(_.keys(Message.$tags),function(tag){var value=Message.$tags[tag];return-1!=value[0].search(re)})},Message.prototype.$absolutePath=function(options){var path;return path=_.map(this.$mailbox.path.split("/"),function(component){return"folder"+component.asCSSIdentifier()}),path.splice(0,0,this.accountId),options&&options.asDraft&&this.draftId?path.push(this.draftId):path.push(this.uid),path.join("/")},Message.prototype.$setUID=function(uid){var oldUID=this.uid||-1;oldUID!=uid&&(this.uid=uid,this.id=this.$absolutePath(),oldUID>-1&&this.$mailbox.uidsMap[oldUID]&&(this.$mailbox.uidsMap[uid]=this.$mailbox.uidsMap[oldUID],this.$mailbox.uidsMap[oldUID]=null))},Message.prototype.$formatFullAddresses=function(){var _this=this;_.each(["from","to","cc","bcc","reply-to"],function(type){_.each(_this[type],function(data,i){data.name&&data.name!=data.email?data.full=data.name+" <"+data.email+">":data.full="<"+data.email+">"})})},Message.prototype.$shortAddress=function(type){var address="";return this[type]&&this[type].length>0&&(address=this[type][0].name||this[type][0].email||""),address},Message.prototype.loadUnsafeContent=function(){this.$loadUnsafeContent=!0},Message.prototype.$content=function(){var _this=this,parts=[],_visit=function(part){"UIxMailPartAlternativeViewer"==part.type?_visit(_.find(part.content,function(alternatePart){return part.preferredPart==alternatePart.contentType})):angular.isArray(part.content)?_.each(part.content,function(mixedPart){_visit(mixedPart)}):(angular.isUndefined(part.safeContent)&&(part.safeContent=part.content,_this.$hasUnsafeContent=part.safeContent.indexOf(" unsafe-")>-1),"UIxMailPartHTMLViewer"==part.type?(part.html=!0,_this.$loadUnsafeContent?(angular.isUndefined(part.unsafeContent)&&(part.unsafeContent=document.createElement("div"),part.unsafeContent.innerHTML=part.safeContent,angular.forEach(["src","data","classid","background","style"],function(suffix){var element,value,i,elements=part.unsafeContent.querySelectorAll("[unsafe-"+suffix+"]");for(i=0;i<elements.length;i++)element=angular.element(elements[i]),value=element.attr("unsafe-"+suffix),element.attr(suffix,value),element.removeAttr("unsafe-"+suffix)})),part.content=Message.$sce.trustAs("html",part.unsafeContent.innerHTML)):part.content=Message.$sce.trustAs("html",part.safeContent),parts.push(part)):"UIxMailPartICalViewer"==part.type||"UIxMailPartImageViewer"==part.type||"UIxMailPartLinkViewer"==part.type?(part.participants&&_.each(part.participants,function(participant){participant.image=Message.$gravatar(participant.email,32)}),part.compile=!0,parts.push(part)):(part.html=!0,part.content=Message.$sce.trustAs("html",part.safeContent),parts.push(part)))};return _visit(this.parts),parts},Message.prototype.$editableContent=function(){var _this=this;return Message.$$resource.fetch(this.id,"edit").then(function(data){return angular.extend(_this,data),Message.$$resource.fetch(_this.$absolutePath({asDraft:!0}),"edit").then(function(data){return Message.$log.debug("editable = "+JSON.stringify(data,void 0,2)),angular.extend(_this.editable,data),data.text})})},Message.prototype.addTag=function(tag){return this.$addOrRemoveTag("add",tag)},Message.prototype.removeTag=function(tag){return this.$addOrRemoveTag("remove",tag)},Message.prototype.$addOrRemoveTag=function(operation,tag){var data={operation:operation,msgUIDs:[this.uid],flags:tag};return tag?Message.$$resource.post(this.$mailbox.$id(),"addOrRemoveLabel",data):void 0},Message.prototype.$imipAction=function(path,action,data){var _this=this;Message.$$resource.post([this.id,path].join("/"),action,data).then(function(data){Message.$timeout(function(){_this.$reload()},function(){})})},Message.prototype.$sendMDN=function(){return this.shouldAskReceipt=0,Message.$$resource.post(this.id,"sendMDN")},Message.prototype.$deleteAttachment=function(filename){var action="deleteAttachment?filename="+filename,_this=this;Message.$$resource.post(this.$absolutePath({asDraft:!0}),action).then(function(data){Message.$timeout(function(){_this.editable.attachmentAttrs=_.filter(_this.editable.attachmentAttrs,function(attachment){return attachment.filename!=filename})},function(){})})},Message.prototype.toggleFlag=function(){var _this=this,action="markMessageFlagged";return this.isflagged&&(action="markMessageUnflagged"),Message.$$resource.post(this.id,action).then(function(data){Message.$timeout(function(){_this.isflagged=!_this.isflagged})})},Message.prototype.$reload=function(){var futureMessageData;return futureMessageData=Message.$$resource.fetch(this.id,"view"),this.$unwrap(futureMessageData)},Message.prototype.$reply=function(){return this.$newDraft("reply")},Message.prototype.$replyAll=function(){return this.$newDraft("replyall")},Message.prototype.$forward=function(){return this.$newDraft("forward")},Message.prototype.$newDraft=function(action){var _this=this;return Message.$$resource.fetch(this.id,action).then(function(data){var mailbox,message;return Message.$log.debug("New "+action+": "+JSON.stringify(data,void 0,2)),mailbox=_this.$mailbox.$account.$getMailboxByPath(data.mailboxPath),message=new Message(data.accountId,mailbox,data),Message.$$resource.fetch(message.$absolutePath({asDraft:!0}),"edit").then(function(data){return Message.$log.debug("New "+action+": "+JSON.stringify(data,void 0,2)),angular.extend(message.editable,data),message})})},Message.prototype.$save=function(){var _this=this,data=this.editable;return Message.$log.debug("save = "+JSON.stringify(data,void 0,2)),Message.$$resource.save(this.$absolutePath({asDraft:!0}),data).then(function(response){Message.$log.debug("save = "+JSON.stringify(response,void 0,2)),_this.$setUID(response.uid),_this.$reload()})},Message.prototype.$send=function(){var data=angular.copy(this.editable),deferred=Message.$q.defer();return Message.$log.debug("send = "+JSON.stringify(data,void 0,2)),Message.$$resource.post(this.$absolutePath({asDraft:!0}),"send",data).then(function(data){"success"==data.status?deferred.resolve(data):deferred.reject(data)}),deferred.promise},Message.prototype.$unwrap=function(futureMessageData){var _this=this,deferred=Message.$q.defer();return this.$futureMessageData=futureMessageData,this.$futureMessageData.then(function(data){Message.$timeout(function(){angular.extend(_this,data),_this.id=_this.$absolutePath(),_this.$formatFullAddresses(),_this.$loadUnsafeContent=!1,deferred.resolve(_this)}),_this.isread||Message.$$resource.fetch(_this.id,"markMessageRead").then(function(){Message.$timeout(function(){_this.isread=!0,_this.$mailbox.unseenCount--})})},function(data){angular.extend(_this,data),_this.isError=!0,Message.$log.error(_this.error),deferred.reject()}),deferred.promise},Message.prototype.$omit=function(){var message={};return angular.forEach(this,function(value,key){"constructor"!=key&&"$"!=key[0]&&(message[key]=value)}),_.each(["from","to","cc","bcc","reply-to"],function(type){message[type]&&(message[type]=_.invoke(message[type].split(","),"trim"))}),message}}();
//# sourceMappingURL=Mailer.services.js.map