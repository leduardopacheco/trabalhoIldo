package br.unifor.healthsys.notificacoes.controller;

import br.unifor.healthsys.notificacoes.model.Notificacao;
import br.unifor.healthsys.notificacoes.service.NotificacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacoes")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService notificacaoService;

    @PostMapping
    public ResponseEntity<Notificacao> criar(@Valid @RequestBody Notificacao notificacao) {
        return ResponseEntity.status(201).body(notificacaoService.criar(notificacao));
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Notificacao>> listarPorUsuario(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(notificacaoService.listarPorUsuario(idUsuario));
    }

    @GetMapping("/usuario/{idUsuario}/nao-lidas")
    public ResponseEntity<List<Notificacao>> listarNaoLidas(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(notificacaoService.listarNaoLidas(idUsuario));
    }

    @GetMapping("/usuario/{idUsuario}/contagem")
    public ResponseEntity<Map<String, Long>> contarNaoLidas(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(Map.of("naoLidas", notificacaoService.contarNaoLidas(idUsuario)));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Notificacao> marcarComoLida(@PathVariable Long id) {
        return ResponseEntity.ok(notificacaoService.marcarComoLida(id));
    }

    @PatchMapping("/usuario/{idUsuario}/marcar-todas-lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(@PathVariable Long idUsuario) {
        notificacaoService.marcarTodasComoLidas(idUsuario);
        return ResponseEntity.noContent().build();
    }
}
