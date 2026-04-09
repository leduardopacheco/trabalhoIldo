package br.unifor.healthsys.usuarios.controller;

import br.unifor.healthsys.usuarios.config.JwtUtil;
import br.unifor.healthsys.usuarios.dto.LoginDTO;
import br.unifor.healthsys.usuarios.dto.RegistroDTO;
import br.unifor.healthsys.usuarios.dto.UsuarioResponseDTO;
import br.unifor.healthsys.usuarios.model.Usuario;
import br.unifor.healthsys.usuarios.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginDTO dto) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.senha())
        );
        String token = jwtUtil.generateToken((Usuario) auth.getPrincipal());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponseDTO> registro(@Valid @RequestBody RegistroDTO dto) {
        return ResponseEntity.status(201).body(usuarioService.criar(dto));
    }
}
