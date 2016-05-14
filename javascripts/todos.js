var App = {
  $el: $('main'),
  $list: $('#todos'),

  addTodo: function(e) {
    e.preventDefault();
    var name = $(e.target).find('#todo_name').val(),
        model,
        view;

    if (!name) { return; }

    model = this.list.add({ name: name });
    view = new this.TodoView({ model: model });
    view.$el.appendTo(this.$list);

    e.target.reset();
  },

  clearDone: function(e) {
    e.preventDefault();
    var incomplete = this.list.where({ done: false });

    this.list.set(incomplete);
  },

  bind: function() {
    this.$el.find("form").on("submit", this.addTodo.bind(this));
    this.$el.find("#clear").on("click", this.clearDone.bind(this));
  },

  cacheTemplates: function() {
    $("[type='text/x-handlebars']").each(function() {
      var $t = $(this);

      templates[$t.attr("id")] = Handlebars.compile($t.html());
    });
  },

  init: function() {
    this.cacheTemplates();
    this.list = new this.Todos();
    this.bind();
  }
};

var templates = {};

App.Todo = Backbone.Model.extend({
  idAttribute: 'id',

  initialize: function() {
    this.set('done', false);

    if(!this.get('id')) {
      this.set('id', this.collection.nextID());
    }
  }
});
App.Todos = Backbone.Collection.extend({
  model: App.Todo,
  last_id: 0,

  setLastID: function() {
    if (this.isEmpty()) { return; }
    this.last_id = this.last().get('id');
  },

  nextID: function() {
    return ++this.last_id;
  }
});
App.TodoView = Backbone.View.extend({
  tagName: 'li',
  // template: templates['todo'],

  events: {
    'click': 'editTodo',
    'click a.toggle': 'toggleDone'
  },

  editTodo: function(e) {
    var $target = $(e.target),
        id = +$target.data("id"),
        model = App.list.get(id),
        $edit_form = $(templates.todo_edit(model.attributes));

    this.$el.after($edit_form);
    this.$el.remove();

    $edit_form.find('input').focus();
    $edit_form.on("blur", "input", this.hideEdit.bind(this));
  },

  hideEdit: function(e) {
    var $input = $(e.currentTarget),
        $li = $input.closest('li'),
        name = $input.val();

    this.model.set('name', name);
    $li.after(this.$el);
    $li.remove();
    $input.off(e);
    this.delegateEvents();
  },

  toggleDone: function(e) {
    var $li = $(e.target).closest('li'),
        id = +$li.data('id'),
        model = App.list.get(id);

    model.set('done', !model.get('done'));
    $li.toggleClass('complete', model.get('done'));
    return false;
  },

  render: function() {
    this.$el.attr('data-id', this.model.get('id'));
    this.$el.html(this.template(this.model.toJSON()));
  },

  initialize: function() {
    this.template = templates.todo
    this.render();
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'remove', this.remove);
  }
});

App.init();
