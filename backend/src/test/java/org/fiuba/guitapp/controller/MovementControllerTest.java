package org.fiuba.guitapp.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.fiuba.guitapp.dto.MovementResponse;
import org.fiuba.guitapp.service.MovementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MovementControllerTest {

    private MockMvc mockMvc;

    @Mock
    private MovementService movementService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        MovementController controller = new MovementController(movementService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getAllMovementsReturnsOk() throws Exception {
        MovementResponse r = new MovementResponse(UUID.randomUUID(), "INCOME", BigDecimal.TEN, "desc", "CAT", LocalDateTime.now());
        when(movementService.getAllMovements("test@example.com")).thenReturn(List.of(r));

        Principal p = () -> "test@example.com";

        mockMvc.perform(get("/api/movements").principal(p))
                .andExpect(status().isOk())
                .andExpect(content().json("[{'id':'" + r.id().toString() + "'}]"));
    }
}
