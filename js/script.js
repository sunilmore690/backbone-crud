

var UserModel = Backbone.Model.extend({
  urlRoot: 'https://sunilmore-rest-api.herokuapp.com/api/users',
  idAttribute : 'id',
});


var Users = Backbone.Collection.extend({
    model: UserModel,
    url:'https://sunilmore-rest-api.herokuapp.com/api/users'
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
    this.model = new UserModel({id:id});
    // this.model.unset('id');
    var that = this;
    if(!id){
      var source = $('#user-info-template').html();
      var template = Handlebars.compile(source);
      var html = template(that.model.attributes);
      that.$el.html(html);
      that.bindModel()
      that.$el.modal('show'); 
      return false;
    }
    //update user
    this.model.fetch({
      success : function(){
        var source = $('#user-info-template').html();
        var template = Handlebars.compile(source);
        var html = template(that.model.attributes);
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
      };
      this._modelBinder.bind(this.model, this.el, bindings);
    },
    updateUser : function(e){
      var that = this;
      this.model.save({},{
        success:function(){
          that.$el.modal('hide');
          router.currentView.render();
        }
      })
    }
  });
var UserList = Backbone.View.extend({
    el:'.page',

    container: '#user-list-template table tbody',
    tagName: 'tr',
    events: {
      'click #useredit' : 'userEdit',
      'click #userdelete' : 'userDelete',
      'click #adduser' : 'userAdd'
    },
    initialize:function(){
      this.collection = new Users();
      this.userModalView = new userView();
    },    
    userEdit :function (e){
      var id = $(e.currentTarget).data('id');
      this.userModalView.render(id);
    },
    userDelete : function(e){
      var id = $(e.currentTarget).data('id');
      var $target = $(e.currentTarget)
        , $parent = $target.parents('tr')
      this.user = new UserModel({id:id});
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
    '': 'home'
    }
  });
  var router = new Router();
  window.App = window.App || {};
  window.App.router = router;  
  router.on('route:home',function(){
    router.currentView = new UserList();
    router.currentView.render();
  });
  Backbone.history.start();