var RepoListModel = Backbone.Model.extend({
});

var UserModel = Backbone.Model.extend({
  urlRoot: 'https://sunilmore-rest-api.herokuapp.com/api/users',
  idAttribute : 'id',
});

var Repos = Backbone.Collection.extend({
  model: RepoListModel,
	initialize: function(models, options){
		this.url ='https://api.github.com/users/'+ options.id +'/repos';
	}
});

var Users = Backbone.Collection.extend({
    model: UserModel,
    url:'https://sunilmore-rest-api.herokuapp.com/api/users'
});

var ViewRepo = Backbone.View.extend({
  el:'.page',
  initialize:function(id){
    this.collection = new Repos([], { id: id });
  },
  render:function(){
    var that = this;
    this.collection.fetch({
      success: function(){
        var source = $('#repo-list-template').html();
        var template = Handlebars.compile(source);
        var html = template(that.collection.toJSON());
        that.$el.html(html);
      }
    });   
   }
  });
var userView = Backbone.View.extend({
  el:'#user-modal',
  initialize:function(){
    this._modelBinder = new Backbone.ModelBinder();
   },
   events: {
    'click #updateuser' : "updateUser",

    },
  render:function(id){
    this.user = new UserModel();
    this.user.unset('id');
    this.id = id;
    var that = this;
    if(!this.id){
      var source = $('#user-info-template').html();
      var template = Handlebars.compile(source);
      var html = template(that.user.attributes);
      that.$el.html(html);
      that.bindModel()
      that.$el.modal('show'); 
      return false;
    } 
    this.user.set({id:this.id});
    this.user.fetch({
      success : function(){
        var source = $('#user-info-template').html();
        var template = Handlebars.compile(source);
        var html = template(that.user.attributes);
        that.$el.html(html);
        that.bindModel()
        that.$el.modal('show'); 
      }
    })   
   },
   bindModel : function(){
     var bindings = {
        name: '[name=name]',
        age: '[name=age]',
        sex: '[name=sex]'
        // driversLicense: '[name=driversLicense]',
        // motorcycleLicense: '[name=motorcycleLicense]',
        // graduated: [{
        //     selector: '[name=graduated]'},
        // {
        //     selector: '[name=driversLicense],[name=motorcycleLicense]',
        //     elAttribute: 'enabled',
        //     converter: function(direction, value) {
        //         return value === 'yes';
        //     }}],
        // eyeColor: [{
        //     selector: '[name=eyeColor]'},
        // {
        //     selector: 'span.label',
        //     elAttribute: 'style',
        //     converter: function(direction, value) {
        //         return 'color:' + value
        //     }}]
    };
     this._modelBinder.bind(this.user, this.el, bindings);
  },
   updateUser : function(e){
    var that = this;
    this.user.save({},{
      success:function(){
       that.$el.modal('hide');
       // that.$el.remove(); 
      }
    })
   }
  });
var UserList = Backbone.View.extend({
    el:'.page',

    container: '#user-list-template table tbody',
    tagName: 'tr',
    events: {
    'click #viewRepo' : "viewRepo",
    'click #useredit' : 'userEdit',
    'click #userdelete' : 'userDelete',
    'click #adduser' : 'userAdd'
    
    },
    initialize:function(){
      this.collection = new Users();
      this.userModalView = new userView();
      // this.listenTo(this.collection, "add", this.render());   
    },
    viewRepo: function(e){
      var id = $(e.currentTarget).data('id');
      router.navigate('repo/'+ id , true);
      return false;
    },      
    userEdit :function (e){
      var that = this;
      var id = $(e.currentTarget).data('id');
      this.userModalView.render(id);
      
    },
   userDelete : function(e){
    console.log('Calling to user delete')
    var that = this;
    var id = $(e.currentTarget).data('id');
     var $target = $(e.currentTarget)
      , $parent = $target.parents('tr')
    this.user = new UserModel();
    this.user.set({id:id})
    this.user.url = 'https://sunilmore-rest-api.herokuapp.com/api/users/'+id;
    this.user.destroy({
      success:function(){
        $parent.fadeOut(function() {
          $parent.remove();
        });
      }
     })
    },
    userAdd : function(e){
     
      this.userModalView.render();
    },
   render:function(){
      this.collection.fetch({
        success:function(){
          var source = $('#user-list-template').html();
          var template = Handlebars.compile(source);
          var html = template(this.collection.toJSON());
          this.$el.html(html); 
        }.bind(this)
      });
      return this;
    }
  });

 var Router = Backbone.Router.extend({
    routes:{
    '': 'home',
    'repo/:id':'viewRepo'
    }
  });
  var router = new Router();
  window.App = window.App || {};
  window.App.router = router;  
  router.on('route:home',function(){
    router.currentView = new UserList();
    router.currentView.render();
  });
  router.on('route:viewRepo',function(id){
    router.currentView = new ViewRepo(id);
    router.currentView.render();
  });

Backbone.history.start();