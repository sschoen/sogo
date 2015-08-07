!function(){"use strict";function AddressBook(futureAddressBookData){if("function"!=typeof futureAddressBookData.then)if(this.init(futureAddressBookData),this.name&&!this.id){var newAddressBookData=AddressBook.$$resource.create("createFolder",this.name);this.$unwrap(newAddressBookData)}else this.id&&(this.$acl=new AddressBook.$$Acl("Contacts/"+this.id));else this.$unwrap(futureAddressBookData)}AddressBook.$factory=["$q","$timeout","$log","sgSettings","Resource","Card","Acl","Preferences",function($q,$timeout,$log,Settings,Resource,Card,Acl,Preferences){return angular.extend(AddressBook,{$q:$q,$timeout:$timeout,$log:$log,$$resource:new Resource(Settings.activeUser("folderURL")+"Contacts",Settings.activeUser()),$Card:Card,$$Acl:Acl,$Preferences:Preferences,activeUser:Settings.activeUser(),selectedFolder:null,$refreshTimeout:null}),AddressBook}];try{angular.module("SOGo.ContactsUI")}catch(e){angular.module("SOGo.ContactsUI",["SOGo.Common"])}angular.module("SOGo.ContactsUI").factory("AddressBook",AddressBook.$factory),AddressBook.$filterAll=function(search,options,excludedCards){var params={search:search};if(!search)return AddressBook.$cards=[],AddressBook.$q.when(AddressBook.$cards);if(angular.isUndefined(AddressBook.$cards))AddressBook.$cards=[];else if(AddressBook.$query==search)return AddressBook.$q.when(AddressBook.$cards);return AddressBook.$query=search,angular.extend(params,options),AddressBook.$$resource.fetch(null,"allContactSearch",params).then(function(response){var results,card,index,compareIds=function(data){return this.id==data.id};for(results=excludedCards?_.filter(response.contacts,function(data){return _.isUndefined(_.find(excludedCards,compareIds,data))}):response.contacts,index=AddressBook.$cards.length-1;index>=0;index--)card=AddressBook.$cards[index],_.isUndefined(_.find(results,compareIds,card))&&AddressBook.$cards.splice(index,1);return _.each(results,function(data,index){if(_.isUndefined(_.find(AddressBook.$cards,compareIds,data))){var card=new AddressBook.$Card(data,search);AddressBook.$cards.splice(index,0,card)}}),AddressBook.$cards})},AddressBook.$add=function(addressbook){var list,sibling,i;list=addressbook.isSubscription?this.$subscriptions:this.$addressbooks,sibling=_.find(list,function(o){return"personal"==addressbook.id||"personal"!=o.id&&1===o.name.localeCompare(addressbook.name)}),i=sibling?_.indexOf(_.pluck(list,"id"),sibling.id):1,list.splice(i,0,addressbook)},AddressBook.$findAll=function(data){var _this=this;return data&&(this.$addressbooks=[],this.$subscriptions=[],this.$remotes=[],angular.forEach(data,function(o,i){var addressbook=new AddressBook(o);addressbook.isRemote?_this.$remotes.push(addressbook):addressbook.isSubscription?_this.$subscriptions.push(addressbook):_this.$addressbooks.push(addressbook)})),this.$addressbooks},AddressBook.$find=function(addressbookId){var futureAddressBookData=AddressBook.$$resource.fetch(addressbookId,"view");return new AddressBook(futureAddressBookData)},AddressBook.$subscribe=function(uid,path){var _this=this;return AddressBook.$$resource.userResource(uid).fetch(path,"subscribe").then(function(addressbookData){var addressbook=new AddressBook(addressbookData);return _.isUndefined(_.find(_this.$subscriptions,function(o){return o.id==addressbookData.id}))&&AddressBook.$add(addressbook),addressbook})},AddressBook.prototype.init=function(data){this.$cards=[],this.cards=[],angular.extend(this,data),this.isOwned=AddressBook.activeUser.isSuperUser||this.owner==AddressBook.activeUser.login,this.isSubscription=!this.isRemote&&this.owner!=AddressBook.activeUser.login,this.$query={search:"name_or_address",value:"",sort:"c_cn",asc:"true"}},AddressBook.prototype.$id=function(){return this.id?AddressBook.$q.when(this.id):this.$futureAddressBookData.then(function(addressbook){return addressbook.id})},AddressBook.prototype.$selectedCount=function(){var count;return count=0,this.cards&&(count=_.filter(this.cards,function(card){return card.selected}).length),count},AddressBook.prototype.$startRefreshTimeout=function(){var _this=this;AddressBook.$refreshTimeout&&AddressBook.$timeout.cancel(AddressBook.$refreshTimeout),AddressBook.$Preferences.ready().then(function(){var refreshViewCheck=AddressBook.$Preferences.defaults.SOGoRefreshViewCheck;if(refreshViewCheck&&"manually"!=refreshViewCheck){var f=angular.bind(_this,AddressBook.prototype.$reload);AddressBook.$refreshTimeout=AddressBook.$timeout(f,1e3*refreshViewCheck.timeInterval())}})},AddressBook.prototype.$reload=function(){var _this=this;return this.$startRefreshTimeout(),AddressBook.$$resource.fetch(this.id,"view").then(function(response){var index,card,results=response.cards,cards=_this.cards,compareIds=function(data){return this.id==data.id};for(index=cards.length-1;index>=0;index--)card=cards[index],_.isUndefined(_.find(results,compareIds,card))&&cards.splice(index,1);return _.each(results,function(data,index){if(_.isUndefined(_.find(cards,compareIds,data))){var card=new AddressBook.$Card(data);cards.splice(index,0,card)}}),cards})},AddressBook.prototype.$filter=function(search,options,excludedCards){var _this=this;if(options&&(angular.extend(this.$query,options),options.dry)){if(!search)return this.$cards=[],AddressBook.$q.when(this.$cards);if(this.$query.value==search)return AddressBook.$q.when(this.$cards)}return this.$query.value=search,this.$id().then(function(addressbookId){return AddressBook.$$resource.fetch(addressbookId,"view",_this.$query)}).then(function(response){var results,cards,card,index,compareIds=function(data){return this.id==data.id};for(cards=options&&options.dry?_this.$cards:_this.cards,results=excludedCards?_.filter(response.cards,function(card){return _.isUndefined(_.find(excludedCards,compareIds,card))}):response.cards,index=cards.length-1;index>=0;index--)card=cards[index],_.isUndefined(_.find(results,compareIds,card))&&cards.splice(index,1);return _.each(results,function(data,index){if(_.isUndefined(_.find(cards,compareIds,data))){var card=new AddressBook.$Card(data,search);cards.splice(index,0,card)}}),_.each(results,function(data,index){var oldIndex,removedCards;cards[index].id!=data.id&&(oldIndex=_.findIndex(cards,compareIds,data),removedCards=cards.splice(oldIndex,1),cards.splice(index,0,removedCards[0]))}),cards})},AddressBook.prototype.$rename=function(name){var i=_.indexOf(_.pluck(AddressBook.$addressbooks,"id"),this.id);return this.name=name,AddressBook.$addressbooks.splice(i,1),AddressBook.$add(this),this.$save()},AddressBook.prototype.$delete=function(){var list,promise,_this=this,d=AddressBook.$q.defer();return this.isSubscription?(promise=AddressBook.$$resource.fetch(this.id,"unsubscribe"),list=AddressBook.$subscriptions):(promise=AddressBook.$$resource.remove(this.id),list=AddressBook.$addressbooks),promise.then(function(){var i=_.indexOf(_.pluck(list,"id"),_this.id);list.splice(i,1),d.resolve()},function(data,status){d.reject(data)}),d.promise},AddressBook.prototype.$deleteCards=function(cards){var uids=_.map(cards,function(card){return card.id}),_this=this;return AddressBook.$$resource.post(this.id,"batchDelete",{uids:uids}).then(function(){_this.cards=_.difference(_this.cards,cards)})},AddressBook.prototype.$save=function(){return AddressBook.$$resource.save(this.id,this.$omit()).then(function(data){return data})},AddressBook.prototype.$getCard=function(cardId){return this.$id().then(function(addressbookId){return AddressBook.$Card.$find(addressbookId,cardId)})},AddressBook.prototype.$unwrap=function(futureAddressBookData){var _this=this;this.$futureAddressBookData=futureAddressBookData.then(function(data){return AddressBook.$timeout(function(){return angular.forEach(AddressBook.$findAll(),function(o,i){o.id==data.id&&angular.extend(_this,o)}),_this.init(data),angular.forEach(_this.cards,function(o,i){_this.cards[i]=new AddressBook.$Card(o)}),_this.$acl=new AddressBook.$$Acl("Contacts/"+_this.id),_this.$startRefreshTimeout(),_this})},function(data){_this.isError=!0,angular.isObject(data)&&AddressBook.$timeout(function(){angular.extend(_this,data)})})},AddressBook.prototype.$omit=function(){var addressbook={};return angular.forEach(this,function(value,key){"constructor"!=key&&"cards"!=key&&"$"!=key[0]&&(addressbook[key]=value)}),addressbook}}(),function(){"use strict";function Card(futureCardData,partial){if("function"!=typeof futureCardData.then){if(this.init(futureCardData,partial),this.pid&&!this.id){var newCardData=Card.$$resource.newguid(this.pid);this.$unwrap(newCardData),this.isNew=!0}}else this.$unwrap(futureCardData)}Card.$TEL_TYPES=["work","home","cell","fax","pager"],Card.$EMAIL_TYPES=["work","home","pref"],Card.$URL_TYPES=["work","home","pref"],Card.$ADDRESS_TYPES=["work","home"],Card.$factory=["$timeout","sgSettings","Resource","Preferences","Gravatar",function($timeout,Settings,Resource,Preferences,Gravatar){return angular.extend(Card,{$$resource:new Resource(Settings.activeUser("folderURL")+"Contacts",Settings.activeUser()),$timeout:$timeout,$gravatar:Gravatar}),Preferences.ready().then(function(){Preferences.defaults.SOGoContactsCategories&&(Card.$categories=Preferences.defaults.SOGoContactsCategories)}),Card}];try{angular.module("SOGo.ContactsUI")}catch(e){angular.module("SOGo.ContactsUI",["SOGo.Common"])}angular.module("SOGo.ContactsUI").factory("Card",Card.$factory),Card.$find=function(addressbookId,cardId){var futureCardData=this.$$resource.fetch([addressbookId,cardId].join("/"),"view");return cardId?new Card(futureCardData):Card.$unwrapCollection(futureCardData)},Card.filterCategories=function(query){var re=new RegExp(query,"i");return _.filter(Card.$categories,function(category){return-1!=category.search(re)})},Card.$unwrapCollection=function(futureCardData){var collection={};return collection.$futureCardData=futureCardData,futureCardData.then(function(cards){Card.$timeout(function(){angular.forEach(cards,function(data,index){collection[data.id]=new Card(data)})})}),collection},Card.prototype.init=function(data,partial){this.refs=[],angular.extend(this,data),this.$$fullname||(this.$$fullname=this.$fullname()),this.$$email||(this.$$email=this.$preferredEmail(partial)),this.$$image||(this.$$image=this.image||Card.$gravatar(this.$preferredEmail(partial),32)),this.selected=!1,this.empty=" "},Card.prototype.$id=function(){return this.$futureCardData.then(function(data){return data.id})},Card.prototype.$save=function(){var _this=this,action="saveAsContact";return"vlist"==this.c_component&&(action="saveAsList"),Card.$$resource.save([this.pid,this.id||"_new_"].join("/"),this.$omit(),{action:action}).then(function(data){return _this.$shadowData=_this.$omit(!0),data})},Card.prototype.$delete=function(attribute,index){return attribute?void(index>-1&&this[attribute].length>index&&this[attribute].splice(index,1)):Card.$$resource.remove([this.pid,this.id].join("/"))},Card.prototype.$fullname=function(){var names,fn=this.c_cn||"";return 0===fn.length&&(names=[],this.c_givenname&&this.c_givenname.length>0&&names.push(this.c_givenname),this.nickname&&this.nickname.length>0&&names.push("<em>"+this.nickname+"</em>"),this.c_sn&&this.c_sn.length>0&&names.push(this.c_sn),names.length>0?fn=names.join(" "):this.c_org&&this.c_org.length>0?fn=this.c_org:this.emails&&this.emails.length>0?fn=_.find(this.emails,function(i){return""!==i.value}).value:this.c_cn&&this.c_cn.length>0&&(fn=this.c_cn)),fn},Card.prototype.$description=function(){var description=[];return this.title&&description.push(this.title),this.role&&description.push(this.role),this.orgUnits&&this.orgUnits.length>0&&_.forEach(this.orgUnits,function(unit){""!==unit.value&&description.push(unit.value)}),this.org&&description.push(this.org),this.description&&description.push(this.description),description.join(", ")},Card.prototype.$preferredEmail=function(partial){var email,re;return partial&&(re=new RegExp(partial,"i"),email=_.find(this.emails,function(o){return re.test(o.value)})),email?email=email.value:(email=_.find(this.emails,function(o){return"pref"==o.type}),email=email?email.value:this.emails&&this.emails.length?this.emails[0].value:""),email},Card.prototype.$shortFormat=function(partial){var fullname=this.$fullname(),email=this.$preferredEmail(partial);return email&&email!=fullname&&(fullname+=" <"+email+">"),fullname},Card.prototype.$birthday=function(){return new Date(1e3*this.birthday)},Card.prototype.$isCard=function(){return"vcard"==this.c_component},Card.prototype.$isList=function(){return"vlist"==this.c_component},Card.prototype.$addOrgUnit=function(orgUnit){if(angular.isUndefined(this.orgUnits))this.orgUnits=[{value:orgUnit}];else{for(var i=0;i<this.orgUnits.length&&this.orgUnits[i].value!=orgUnit;i++);i==this.orgUnits.length&&this.orgUnits.push({value:orgUnit})}return this.orgUnits.length-1},Card.prototype.$addCategory=function(category){if(angular.isUndefined(this.categories))this.categories=[{value:category}];else{for(var i=0;i<this.categories.length&&this.categories[i].value!=category;i++);i==this.categories.length&&this.categories.push({value:category})}},Card.prototype.$addEmail=function(type){return angular.isUndefined(this.emails)?this.emails=[{type:type,value:""}]:_.isUndefined(_.find(this.emails,function(i){return""===i.value}))&&this.emails.push({type:type,value:""}),this.emails.length-1},Card.prototype.$addPhone=function(type){return angular.isUndefined(this.phones)?this.phones=[{type:type,value:""}]:_.isUndefined(_.find(this.phones,function(i){return""===i.value}))&&this.phones.push({type:type,value:""}),this.phones.length-1},Card.prototype.$addUrl=function(type,url){return angular.isUndefined(this.urls)?this.urls=[{type:type,value:url}]:_.isUndefined(_.find(this.urls,function(i){return i.value==url}))&&this.urls.push({type:type,value:url}),this.urls.length-1},Card.prototype.$addAddress=function(type,postoffice,street,street2,locality,region,country,postalcode){return angular.isUndefined(this.addresses)?this.addresses=[{type:type,postoffice:postoffice,street:street,street2:street2,locality:locality,region:region,country:country,postalcode:postalcode}]:_.find(this.addresses,function(i){return i.street==street&&i.street2==street2&&i.locality==locality&&i.country==country&&i.postalcode==postalcode})||this.addresses.push({type:type,postoffice:postoffice,street:street,street2:street2,locality:locality,region:region,country:country,postalcode:postalcode}),this.addresses.length-1},Card.prototype.$addMember=function(email){var i,card=new Card({email:email,emails:[{value:email}]});if(angular.isUndefined(this.refs))this.refs=[card];else if(0===email.length)this.refs.push(card);else{for(i=0;i<this.refs.length&&this.refs[i].email!=email;i++);i==this.refs.length&&this.refs.push(card)}return this.refs.length-1},Card.prototype.$reset=function(){var _this=this;angular.forEach(this,function(value,key){"constructor"!=key&&"$"!=key[0]&&delete _this[key]}),angular.extend(this,this.$shadowData),angular.forEach(this.refs,function(o,i){o.email&&(o.emails=[{value:o.email}]),_this.refs[i]=new Card(o)}),this.$shadowData=this.$omit(!0)},Card.prototype.$unwrap=function(futureCardData){var _this=this;this.$futureCardData=futureCardData,this.$futureCardData.then(function(data){Card.$timeout(function(){_this.init(data),angular.forEach(_this.refs,function(o,i){o.email&&(o.emails=[{value:o.email}]),o.id=o.reference,_this.refs[i]=new Card(o)}),_this.birthday&&(_this.birthday=new Date(1e3*_this.birthday)),_this.$shadowData=_this.$omit(!0)})})},Card.prototype.$omit=function(deep){var card={};return angular.forEach(this,function(value,key){"refs"==key?card.refs=_.map(value,function(o){return o.$omit(deep)}):"constructor"!=key&&"$"!=key[0]&&(deep?card[key]=angular.copy(value):card[key]=value)}),card},Card.prototype.toString=function(){var desc=this.id+" "+this.$$fullname;return this.$$email&&(desc+=" <"+this.$$email+">"),"["+desc+"]"}}();
//# sourceMappingURL=Contacts.services.js.map