#Description

Navigation component for Backbone based application.

#Installation

Download navigation.js and include it in your HTML:
```
<script src="js/navigation.js"></script>
```

###or via Composer
1) In your composer.json require section:
"twodudes/backbone-navigation": "dev-master"

2) In your javascripts block of a template:

```
{% javascripts
    ...
    '../vendor/twodudes/backbone-navigation/navigation.js'
    ...
%}
    <script type="text/javascript" src="{{ asset_url }}"></script>
{% endjavascripts %}
```

#Usage
##Example. Basic usage
1) Add navigation description to your Backbone Router

```
App.AuthorsRouter = Backbone.Router.extend({
    routes: {
        "authors": "authorsList",
        "author/:id/details": "authorDetails"
    },
    navigation: {
        prefix: 'Authors',
        pages: {
            "Authors.authorsList": {
                template: 'Authors'
            },
            "Authors.authorDetails": {
                template: template: _.template('Author <%= args[":id"] %> details'),
                parent: "Authors.authorsList"
            }
        }
    },
    authorsList: function() {
        //your regular route
    },
    authorDetails: function(id) {
        //your regular route
    }
});
```

2) Append Router to navigation and initialize navigation

```
var authorsRouter = new App.AuthorsRouter();

var navigation = new Backbone.Navigation();
navigation.appendRouter(authorsRouter);
navigation.mapRouters();
```

3) Get your breadcrumbs as a backbone collection
```
navigation.getBreadcrumbs();
```

##Example. Page label templates as a function
In AuthorsRouter.

```
"Authors.authorDetails": {
    template: function(args) {
        var id = args[':id'];
        var d = $.Deferred();
        var author = new App.Model.Author({id: id});
        author.fetch({
            success: function(author) {
                d.resolve('Author ' + author.get('name'));
            }
        });
        return d;
    },
    parent: 'Accounts.list'
},
```

##Example. Many routers
1) Yet another router

```
App.BooksRouter = Backbone.Router.extend({
    routes: {
        "author/:id/books": "booksList"
        "author/:id/book/:bookId/table-of-contents": "bookContents"
    },
    navigation: {
        prefix: 'Books',
        pages: {
            "Books.booksList": {
                template: 'Books',
                parent: "Authors.authorDetails"
            },
            "Books.bookContents": {
                template: template: _.template('Book <%= args[":bookId"] %> contents'),
                parent: "Books.booksList"
            }
        }
    },
    booksList: function() {
        //your regular route
    },
    bookContents: function(id) {
        //your regular route
    }
});
```

2) Append Router to navigation and initialize navigation

```
var authorsRouter = new App.AuthorsRouter();
var booksRouter = new App.BooksRouter();

var navigation = new Backbone.Navigation();
navigation.appendRouter(authorsRouter);
navigation.appendRouter(booksRouter);
navigation.mapRouters();
```


#Tips:
1) navigation.getBreadcrumbs() - is a JQuery Deffered object. Don't forget to use .done(function(){}) callback (see Marionette collection view below).

#Additional materials:
##Marionette collection view for Breadcrumbs:

```
App.Views.Breadcrumb = Backbone.Marionette.ItemView.extend({
    template: _.template('<a href="<%= url %>"><%= text %></a>'),
    tagName: 'li'
});

App.Views.Breadcrumbs = Backbone.Marionette.CollectionView.extend({
    template: _.template(''),
    tagName: 'ul',
    className: 'breadcrumbs',
    itemView: App.Views.Breadcrumb,
    collectionEvents: {
        'change': 'render'
    },
    initialize: function(options) {
        var that = this;
        var navigation = options.navigation; //Backbone.Navigation object
        navigation.getBreadcrumbs().done(function(breadcrumbs) {
            that.collection = breadcrumbs;
            that.render();
            that.listenTo(that.collection, 'add', that.render);
            that.listenTo(that.collection, 'reset', that.render);
        });
    }
});
```