;(function($){

   if( !$.bui ) { $.bui = {}; }

    var xui = {};
    var REG_NUMBER = /^\d+$/;
    
    $.log = function(){
        //if( typeof console == 'undefined' ) return;
        //console.info.apply( console , arguments );
    }
    
    $.error = function(){
        //if( typeof console == 'undefined' ) return;
        //console.error.apply( console , arguments );
    }
    
    function convertIfy( value ) {
        if( typeof value == 'string' ) {
            if( REG_NUMBER.test(value) ) {
                return parseInt( value , 10 );
            }
        }
        return value;
    }
     
    $.RegisterUI = function( uiname , options ){
    
        if( xui[uiname] ) return;
    
        options = options || {};
    
        xui[uiname] = function( element ){
    
            var self = this;
            this.el = element;
            this._options = {} ,
    
            $.each( options.propertychange || {} , function(propname,changeFunc ){
                self.on( propname + "_changed" , changeFunc );
            });
    
            $.each( options.properties || {} , function( propname,value ){
                self._options[ propname ] = value;
            });
    
            this.initialize();
        };
    
        xui[uiname].prototype = $.extend({
    
            options : function( config ) {
                var self = this;
                $.each( config , function(key,value){
                    if( key !== "on" ) {
                        self.set( key , value );    
                    } else {
                        //on - bind all event
                        $.each( value , function(evtName , evtFunc){
                            self.on( evtName , evtFunc );
                        });
                    }
                });
            } ,
    
            dom : function(){
                return this.el;
            },
    
            set : function( name , value , stopTrigger ) {
                value = convertIfy(value);
    
                var param = {
                    name : name , 
                    new_value : value , 
                    old_value : this.get(name)
                };
                if( stopTrigger != true ) {
                    $(this).trigger( name + '_before_change',[ param ]);
                }
                this._options[ name ] = param.new_value;
                if( stopTrigger != true ) {
                    $(this).trigger( name + '_changed',[ value ]);
                }
    
            } ,
    
            get : function( name ) {
                return this._options[name];
            } ,
    
            on : function( eventName , callback ) {
                $(this).bind( eventName , callback );
            } ,
    
            un : function( eventName ) {
                $(this).unbind( eventName );
            } , 
    
            fire : function() {
                var $self = $(this);
                $self.trigger.apply( $self , Array.prototype.slice.apply( arguments ) );
            }
    
        },options);
    
        $.fn[uiname] = function( config ){
    
            if( $.isPlainObject(config) && arguments.length == 1 ) {
    
                return $.each( this , function(){ 
                    var obj = $(this).data( uiname );
                    if( !obj ) {
    
                        var n = new xui[uiname]( this );
                        $(this).data( uiname , n );
    
                        n.options( config );
    
                        if( options.initialized ) {
                            options.initialized.call( n );
                        }
    
                    } else {
                        $(this).data( uiname ).options( config )
                    }
                });
    
            } else if ( typeof config == "string" ) {
                var methodName = arguments[0];
                var args = Array.prototype.slice.call( arguments , 1 );
                var obj = $(this).data( uiname );
                if( $.isFunction( obj[methodName] ) ) {
                    return obj[methodName].apply( obj , args );
                }
            }
    
        };
    
    };

})(jQuery);
