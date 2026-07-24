package com.gridpulse.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaRedirectController {

    @GetMapping(value = "/{path:^(?!api|actuator|ws-notifications)[^\\.]*}")
    public String redirectSingle() {
        return "forward:/index.html";
    }

    @GetMapping(value = "/{path1:^(?!api|actuator|ws-notifications)[^\\.]*}/{path2:[^\\.]*}")
    public String redirectNested() {
        return "forward:/index.html";
    }
}
