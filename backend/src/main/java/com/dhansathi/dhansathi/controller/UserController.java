package com.dhansathi.dhansathi.controller;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
	public String getMessage() {
		return "hello world";
	}
}
