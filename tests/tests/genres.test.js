/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2015 (C) Copyright Gameboard Ltd 2015. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Home Retail Group Ltd.
 *
 *  Unit Test for Genres
 *
 *  author  : Matthew Perrins
 *  email   : matthewperrins@gmail.com
 *  date    : 15th March
 *
 */

var ip = require('../my_modules/invokeRoute');
var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('underscore-node');

    describe ("#/rest/genres", function() {

        it("Access List of Genres", function(done) {
            // Invoke the Promise for the Call
            ip.invoke("/genres","get",null).then(function (data) {
                if(data.response.statusCode == 404) {
                    throw data;
                }
                expect(data.response).not.to.be.null;
                done();
            });  // end callback
        }); // end it

        it("Check we have more than one", function(done) {
            // Invoke the Promise for the Call
            ip.invoke("/genres","get",null).then(function (data) {
                if(data.response.statusCode == 404) {
                    throw data;
                }
                expect(data).not.to.be.null;
                done();
            });  // end callback
        }); // end it

    }); // end describe
