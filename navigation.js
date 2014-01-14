$(function() {
    var Navigation = function() {

        this.d = $.Deferred();
        this.breadcrumbs = new Backbone.Collection();
        this.routers = {};
        this.tree = {};

        var that = this;

        this.appendRouter = function(router) {
            if (typeof(router.navigation) != "undefined") {
                _.extend(that.tree, router.navigation.pages);
                that.routers[router.navigation.prefix] = router;
            }
        };

        this.mapRouters = function() {
            for (var i in that.routers) {
                that.routers[i].bind('route', function (route, args) {
                    var router = this;
                    that.breadcrumbs.reset();
                    var url = that._getRouteUrl(router, route);
                    var mappedArgs = that._getMappedArgs(args, url);
                    that._mapNavigation(router.navigation.prefix + '.' + route, mappedArgs);

                    that.getBreadcrumbs();
                });
            }
        };

        this._getMappedArgs = function(args, link) {
            var route = Backbone.Router.prototype._routeToRegExp(link);
            var argNames = Backbone.Router.prototype._extractParameters(route, link);

            var namedArgs = {};
            for (var i in argNames) {
                namedArgs[argNames[i]] = args[i];
            }
            return namedArgs;
        };

        this._getMappedUrl = function(url, mappedArgs) {
            for (var argName in mappedArgs) {
                var arg = mappedArgs[argName];
                url = url.replace(argName, arg);
            }
            return url;
        };

        this._getProcessedText = function(template, mappedArgs) {
            if (typeof(template) == "function") {
//                return template({ args: mappedArgs });
                return template(mappedArgs).done(function(newText) {

                });
            }
            return template;
        };

        this._mapNavigation = function(route, mappedArgs) {
            if (!that.tree[route]) {
                return;
            }
            
            var isFunction = typeof(that.tree[route].template) == "function";

            var routeParts = route.split('.');
            var router = that.routers[routeParts[0]];
            var shortRoute = routeParts[1];

            var page = new Backbone.Model({
                url: this._getMappedUrl(this._getRouteUrl(router, shortRoute), mappedArgs),
                text: isFunction ? that.tree[route].template(mappedArgs): that.tree[route].template,
                mappedArgs: mappedArgs,
                isResolved: false
            });
            if (isFunction) {
                page.get('text').done(function(template){
                    page.set({'text': template, 'isResolved': true});
                    that.checkBreadcrumbs();
                });
            } else {
                page.set('isResolved', true);
            }
            this.breadcrumbs.unshift(page);

            if (typeof(that.tree[route].parent) != "undefined") {
                this._mapNavigation(that.tree[route].parent, mappedArgs);
            }
        };

        this._getRouteUrl = function(router, route) {
            for (var url in router.routes) {
                if (route == router.routes[url]) {
                    return url;
                }
            }
        };

        this.getBreadcrumbs = function() {
            this.checkBreadcrumbs();
            return this.d;
        };

        this.isAllPagesResolved = function () {
            for (var i = 0; i < this.breadcrumbs.size(); i++) {
                if (!this.breadcrumbs.at(i).get('isResolved')) {
                    return false;
                }
            }
            return true;
        };

        this.checkBreadcrumbs = function() {
            if (this.isAllPagesResolved() && this.breadcrumbs.size() > 0) {
                this.d.resolve(this.breadcrumbs);
            }
        };
    };

    Backbone.Navigation = Navigation;
});