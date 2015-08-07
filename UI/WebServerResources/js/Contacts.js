!function(){"use strict";function configure($stateProvider,$urlRouterProvider){$stateProvider.state("app",{url:"/addressbooks","abstract":!0,views:{addressbooks:{templateUrl:"UIxContactFoldersView",controller:"AddressBooksController",controllerAs:"app"}},resolve:{stateAddressbooks:stateAddressbooks}}).state("app.addressbook",{url:"/:addressbookId",views:{addressbook:{templateUrl:"addressbook",controller:"AddressBookController",controllerAs:"addressbook"}},resolve:{stateAddressbook:stateAddressbook}}).state("app.addressbook.new",{url:"/{contactType:(?:card|list)}/new",views:{card:{templateUrl:"UIxContactEditorTemplate",controller:"CardController",controllerAs:"editor"}},resolve:{stateCard:stateNewCard}}).state("app.addressbook.card",{url:"/:cardId","abstract":!0,views:{card:{template:"<ui-view/>"}},resolve:{stateCard:stateCard}}).state("app.addressbook.card.view",{url:"/view",views:{"card@app.addressbook":{templateUrl:"UIxContactViewTemplate",controller:"CardController",controllerAs:"editor"}}}).state("app.addressbook.card.editor",{url:"/edit",views:{"card@app.addressbook":{templateUrl:"UIxContactEditorTemplate",controller:"CardController",controllerAs:"editor"}}}),$urlRouterProvider.otherwise("/addressbooks/personal")}function stateAddressbooks(AddressBook){return AddressBook.$findAll(window.contactFolders)}function stateAddressbook($stateParams,AddressBook){return AddressBook.$find($stateParams.addressbookId).$futureAddressBookData}function stateNewCard($stateParams,stateAddressbook,Card){var tag="v"+$stateParams.contactType,card=new Card({pid:$stateParams.addressbookId,c_component:tag});return stateAddressbook.selectedCard=!0,card}function stateCard($stateParams,stateAddressbook){return stateAddressbook.selectedCard=$stateParams.cardId,stateAddressbook.$getCard($stateParams.cardId)}function runBlock($rootScope){$rootScope.$on("$routeChangeError",function(event,current,previous,rejection){console.error(event,current,previous,rejection)})}angular.module("SOGo.ContactsUI",["ngSanitize","ui.router","SOGo.Common","SOGo.PreferencesUI"]).config(configure).run(runBlock),configure.$inject=["$stateProvider","$urlRouterProvider"],stateAddressbooks.$inject=["AddressBook"],stateAddressbook.$inject=["$stateParams","AddressBook"],stateNewCard.$inject=["$stateParams","stateAddressbook","Card"],stateCard.$inject=["$stateParams","stateAddressbook"],runBlock.$inject=["$rootScope"]}(),function(){"use strict";function AddressBookController($scope,$state,$timeout,$mdDialog,focus,Card,AddressBook,Dialog,Settings,stateAddressbooks,stateAddressbook){function selectCard(card){$state.go("app.addressbook.card.view",{addressbookId:stateAddressbook.id,cardId:card.id})}function newComponent(ev){function ComponentDialogController(scope,$mdDialog,$state,addressbookId){scope.create=function(type){$mdDialog.hide(),$state.go("app.addressbook.new",{addressbookId:addressbookId,contactType:type})}}$mdDialog.show({parent:angular.element(document.body),targetEvent:ev,clickOutsideToClose:!0,escapeToClose:!0,template:['<md-dialog aria-label="'+l("Create component")+'">',"  <md-dialog-content>",'    <div layout="column">',"      <md-button ng-click=\"create('card')\">","        "+l("Contact"),"      </md-button>","      <md-button ng-click=\"create('list')\">","        "+l("List"),"      </md-button>","    </div>","  </md-dialog-content>","</md-dialog>"].join(""),locals:{addressbookId:vm.selectedFolder.id},controller:ComponentDialogController}),ComponentDialogController.$inject=["scope","$mdDialog","$state","addressbookId"]}function notSelectedComponent(currentCard,type){return currentCard&&currentCard.c_component==type&&!currentCard.selected}function unselectCards(){_.each(vm.selectedFolder.cards,function(card){card.selected=!1})}function confirmDeleteSelectedCards(){Dialog.confirm(l("Warning"),l("Are you sure you want to delete the selected contacts?")).then(function(){var selectedCards=_.filter(vm.selectedFolder.cards,function(card){return card.selected});vm.selectedFolder.$deleteCards(selectedCards),delete vm.selectedFolder.selectedCard},function(data,status){})}function saveSelectedCards(){var selectedCards=_.filter(vm.selectedFolder.cards,function(card){return card.selected}),selectedUIDs=_.pluck(selectedCards,"id");window.location.href=ApplicationBaseURL+"/"+vm.selectedFolder.id+"/export?uid="+selectedUIDs.join("&uid=")}function selectAll(){_.each(vm.selectedFolder.cards,function(card){card.selected=!0})}function sort(field){vm.selectedFolder.$filter("",{sort:field})}function sortedBy(field){return vm.selectedFolder.$query.sort==field}function cancelSearch(){vm.mode.search=!1,vm.selectedFolder.$filter("")}var vm=this;AddressBook.selectedFolder=stateAddressbook,vm.selectedFolder=stateAddressbook,vm.selectCard=selectCard,vm.newComponent=newComponent,vm.notSelectedComponent=notSelectedComponent,vm.unselectCards=unselectCards,vm.confirmDeleteSelectedCards=confirmDeleteSelectedCards,vm.saveSelectedCards=saveSelectedCards,vm.selectAll=selectAll,vm.sort=sort,vm.sortedBy=sortedBy,vm.cancelSearch=cancelSearch,vm.mode={search:!1}}AddressBookController.$inject=["$scope","$state","$timeout","$mdDialog","sgFocus","Card","AddressBook","Dialog","sgSettings","stateAddressbooks","stateAddressbook"],angular.module("SOGo.ContactsUI").controller("AddressBookController",AddressBookController)}(),function(){"use strict";function AddressBooksController($state,$scope,$rootScope,$stateParams,$timeout,$mdDialog,focus,Card,AddressBook,Dialog,Settings,User,stateAddressbooks){function select(folder){vm.editMode=!1,$state.go("app.addressbook",{addressbookId:folder.id})}function newAddressbook(){Dialog.prompt(l("New addressbook"),l("Name of new addressbook")).then(function(name){var addressbook=new AddressBook({name:name,isEditable:!0,isRemote:!1,owner:UserLogin});AddressBook.$add(addressbook)})}function edit(folder){folder.isRemote||(vm.editMode=folder.id,vm.originalAddressbook=angular.extend({},folder.$omit()),focus("addressBookName_"+folder.id))}function revertEditing(folder){folder.name=vm.originalAddressbook.name,vm.editMode=!1}function save(folder){var name=folder.name;name&&name.length>0&&name!=vm.originalAddressbook.name&&folder.$rename(name).then(function(data){vm.editMode=!1},function(data,status){Dialog.alert(l("Warning"),data)})}function confirmDelete(){vm.service.selectedFolder.isSubscription?vm.service.selectedFolder.$delete().then(function(){vm.service.selectedFolder=null,$state.go("app.addressbook",{addressbookId:"personal"})},function(data,status){Dialog.alert(l('An error occured while deleting the addressbook "%{0}".',vm.service.selectedFolder.name),l(data.error))}):Dialog.confirm(l("Warning"),l("Are you sure you want to delete the addressbook <em>%{0}</em>?",vm.service.selectedFolder.name)).then(function(){return vm.service.selectedFolder.$delete()}).then(function(){return vm.service.selectedFolder=null,!0})["catch"](function(data,status){Dialog.alert(l('An error occured while deleting the addressbook "%{0}".',vm.service.selectedFolder.name),l(data.error))})}function importCards(){}function exportCards(){window.location.href=ApplicationBaseURL+"/"+vm.service.selectedFolder.id+"/exportFolder"}function showLinks(selectedFolder){function LinksDialogController(scope,$mdDialog){scope.close=function(){$mdDialog.hide()}}$mdDialog.show({parent:angular.element(document.body),clickOutsideToClose:!0,escapeToClose:!0,templateUrl:selectedFolder.id+"/links",locals:{},controller:LinksDialogController}),LinksDialogController.$inject=["scope","$mdDialog"]}function share(addressbook){addressbook.$acl.$users().then(function(){$mdDialog.show({templateUrl:addressbook.id+"/UIxAclEditor",controller:"AclController",controllerAs:"acl",clickOutsideToClose:!0,escapeToClose:!0,locals:{usersWithACL:addressbook.$acl.users,User:User,folder:addressbook}})})}function subscribeToFolder(addressbookData){console.debug("subscribeToFolder "+addressbookData.owner+addressbookData.name),AddressBook.$subscribe(addressbookData.owner,addressbookData.name)["catch"](function(data){Dialog.alert(l("Warning"),l("An error occured please try again."))})}var vm=this;vm.activeUser=Settings.activeUser,vm.service=AddressBook,vm.select=select,vm.newAddressbook=newAddressbook,vm.edit=edit,vm.revertEditing=revertEditing,vm.save=save,vm.confirmDelete=confirmDelete,vm.importCards=importCards,vm.exportCards=exportCards,vm.showLinks=showLinks,vm.share=share,vm.subscribeToFolder=subscribeToFolder}AddressBooksController.$inject=["$state","$scope","$rootScope","$stateParams","$timeout","$mdDialog","sgFocus","Card","AddressBook","Dialog","sgSettings","User","stateAddressbooks"],angular.module("SOGo.ContactsUI").controller("AddressBooksController",AddressBooksController)}(),function(){"use strict";function CardController($scope,$timeout,$mdDialog,AddressBook,Card,Dialog,focus,$state,$stateParams,stateCard){function addOrgUnit(){var i=vm.card.$addOrgUnit("");focus("orgUnit_"+i)}function addEmail(){var i=vm.card.$addEmail("");focus("email_"+i)}function addPhone(){var i=vm.card.$addPhone("");focus("phone_"+i)}function addUrl(){var i=vm.card.$addUrl("","");focus("url_"+i)}function addAddress(){var i=vm.card.$addAddress("","","","","","","","");focus("address_"+i)}function addMember(){var i=vm.card.$addMember("");focus("ref_"+i)}function userFilter($query,excludedCards){return AddressBook.selectedFolder.$filter($query,{dry:!0,excludeLists:!0},excludedCards),AddressBook.selectedFolder.$cards}function save(form){form.$valid&&vm.card.$save().then(function(data){var i=_.indexOf(_.pluck(AddressBook.selectedFolder.cards,"id"),vm.card.id);0>i?AddressBook.selectedFolder.$reload():AddressBook.selectedFolder.cards[i]=angular.copy(vm.card),$state.go("app.addressbook.card.view",{cardId:vm.card.id})})["catch"](function(err){console.log(err)})}function reset(){vm.card.$reset()}function cancel(){vm.card.$reset(),vm.card.isNew?(vm.card=null,delete AddressBook.selectedFolder.selectedCard,$state.go("app.addressbook",{addressbookId:AddressBook.selectedFolder.id})):$state.go("app.addressbook.card.view",{cardId:vm.card.id})}function confirmDelete(card){Dialog.confirm(l("Warning"),l("Are you sure you want to delete the card of %{0}?",card.$fullname()),{ok:l("Yes"),cancel:l("No")}).then(function(){card.$delete().then(function(){AddressBook.selectedFolder.cards=_.reject(AddressBook.selectedFolder.cards,function(o){return o.id==card.id}),vm.card=null,$state.go("app.addressbook",{addressbookId:AddressBook.selectedFolder.id})},function(data,status){Dialog.alert(l("Warning"),l('An error occured while deleting the card "%{0}".',card.$fullname()))})})}function viewRawSource($event){Card.$$resource.post(vm.currentFolder.id+"/"+vm.card.id,"raw").then(function(data){function CardRawSourceDialogController(scope,$mdDialog){scope.close=function(){$mdDialog.hide()}}$mdDialog.show({parent:angular.element(document.body),targetEvent:$event,clickOutsideToClose:!0,escapeToClose:!0,template:['<md-dialog flex="80" flex-sm="100" aria-label="'+l("View Card Source")+'">',"  <md-dialog-content>","    <pre>",data,"    </pre>","  </md-dialog-content>",'  <div class="md-actions">','    <md-button ng-click="close()">'+l("Close")+"</md-button>","  </div>","</md-dialog>"].join(""),controller:CardRawSourceDialogController}),CardRawSourceDialogController.$inject=["scope","$mdDialog"]})}var vm=this;vm.card=stateCard,vm.currentFolder=AddressBook.selectedFolder,vm.allEmailTypes=Card.$EMAIL_TYPES,vm.allTelTypes=Card.$TEL_TYPES,vm.allUrlTypes=Card.$URL_TYPES,vm.allAddressTypes=Card.$ADDRESS_TYPES,vm.categories={},vm.userFilterResults=[],vm.addOrgUnit=addOrgUnit,vm.addEmail=addEmail,vm.addPhone=addPhone,vm.addUrl=addUrl,vm.addAddress=addAddress,vm.addMember=addMember,vm.userFilter=userFilter,vm.save=save,vm.reset=reset,vm.cancel=cancel,vm.confirmDelete=confirmDelete,vm.viewRawSource=viewRawSource}CardController.$inject=["$scope","$timeout","$mdDialog","AddressBook","Card","Dialog","sgFocus","$state","$stateParams","stateCard"],angular.module("SOGo.ContactsUI").controller("CardController",CardController)}(),function(){"use strict";function sgAddress(){return{restrict:"A",scope:{data:"=sgAddress"},controller:["$scope",function($scope){$scope.addressLines=function(data){var lines=[],locality_region=[];return data.street&&lines.push(data.street),data.street2&&lines.push(data.street2),data.locality&&locality_region.push(data.locality),data.region&&locality_region.push(data.region),locality_region.length>0&&lines.push(locality_region.join(", ")),data.country&&lines.push(data.country),data.postalcode&&lines.push(data.postalcode),lines.join("<br>")}}],template:'<address ng-bind-html="addressLines(data)"></address>'}}angular.module("SOGo.Common").directive("sgAddress",sgAddress)}();
//# sourceMappingURL=Contacts.js.map