/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2015 (C) Copyright Gameboard Ltd 2015. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Home Retail Group Ltd.
 *
 *  Unit Test for Members
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

// Data Driven Wrapper
var data_driven = require('data-driven');

// Load the Test Locations
var fs = require("fs");

console.log('Current directory: ' + process.cwd());

var data = JSON.parse(fs.readFileSync('tests/tests/members.json', 'utf8'));

var server = "http://localhost:3002";

// Tests for Location APIs
    describe ("#/rest/members/register", function(){
        it("Create a new member", function(done) {
            // Invoke the Promise for the Call
            ip.invoke("/members/register","post", server,{"json":data.members[0]}).then(function (data) {
                if(data.response.statusCode == 404) {
                    throw response;
                }
                expect(response).not.to.be.null;
                done();
            });  // end callback
        }); // end it
    }); // end describe
