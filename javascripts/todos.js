$(function() {
  var $main = $("main"),
      $todos = $("#todos"),
      todo_edit = Handlebars.compile($("#todo_edit").html()),
      editTodo = function(e) {
        var $target = $(e.target),
            id = +$target.data("id"),
            model = list.get(id),
            $edit_form = $(todo_edit(model.attributes));

        model.view.$el.after($edit_form);
        model.view.$el.remove();

        $edit_form.on("blur", "input", hideEdit);
      },
      newTodo = function(e) {
        e.preventDefault();
        var $f = $(e.target),
            todo = {
              name: $f.find("input").val(),
              done: false
            },
            model,
            view;

        if (!todo.name) { return; }

        model = list.add(todo);
        view = new TodoView(model);
        view.$el.appendTo($todos);

        e.target.reset();
      },
      hideEdit = function(e) {
        var $input = $(e.currentTarget),
            $li = $input.closest('li'),
            name = $input.val(),
            id = +$li.data("id"),
            model = list.get(id);

        model.set("name", name);
        $li.after(model.view.$el);
        $li.remove();
        $input.off(e);
      },
      toggleComplete = function(e) {
        var $li = $(e.target).closest('li'),
            id = +$li.data('id'),
            model = list.get(id);

        model.set('done', !model.get('done'));
        $li.toggleClass('complete', model.get('done'));
        return false;
      },
      clearCompleted = function(e) {
        e.preventDefault();
        var completed = list.models.filter(function(model) {
          return model.attributes.done;
        });

        completed.forEach(function(model) {
          list.remove(model);
        });
      },
      bind = function() {
        $main.find("form").on("submit", newTodo);
        $main.find("#clear").on("click", clearCompleted);
      },
      init = function() {
        bind();
      }

  var Todo = new ModelConstructor(),
      Todos = new CollectionConstructor(),
      list = new Todos(Todo),
      TodoView = new ViewConstructor({
        tag_name: "li",
        template: Handlebars.compile($("#todo").html()),
        events: {
          'click': editTodo,
          'click a.toggle': toggleComplete
        }
      });

  init();
});
