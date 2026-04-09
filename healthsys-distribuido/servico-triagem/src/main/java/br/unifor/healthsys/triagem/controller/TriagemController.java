package br.unifor.healthsys.triagem.controller;

import br.unifor.healthsys.triagem.model.Atendimento;
import br.unifor.healthsys.triagem.model.Triagem;
import br.unifor.healthsys.triagem.service.TriagemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TriagemController {

    private final TriagemService triagemService;

    // ─── Triagens ─────────────────────────────────────────

    @PostMapping("/api/triagens")
    public ResponseEntity<Triagem> realizar(@Valid @RequestBody Triagem triagem) {
        return ResponseEntity.status(201).body(triagemService.realizarTriagem(triagem));
    }

    @GetMapping("/api/triagens/{id}")
    public ResponseEntity<Triagem> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(triagemService.buscarPorId(id));
    }

    @GetMapping("/api/triagens/paciente/{idPaciente}")
    public ResponseEntity<List<Triagem>> listarPorPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(triagemService.listarPorPaciente(idPaciente));
    }

    @GetMapping("/api/triagens/aguardando")
    public ResponseEntity<List<Triagem>> listarAguardando() {
        return ResponseEntity.ok(triagemService.listarAguardando());
    }

    @PatchMapping("/api/triagens/{id}/status")
    public ResponseEntity<Triagem> atualizarStatus(
            @PathVariable Long id,
            @RequestParam Triagem.StatusTriagem status) {
        return ResponseEntity.ok(triagemService.atualizarStatus(id, status));
    }

    // ─── Atendimentos ─────────────────────────────────────

    @PostMapping("/api/atendimentos")
    public ResponseEntity<Atendimento> abrirAtendimento(@Valid @RequestBody Atendimento atendimento) {
        return ResponseEntity.status(201).body(triagemService.abrirAtendimento(atendimento));
    }

    @GetMapping("/api/atendimentos/paciente/{idPaciente}")
    public ResponseEntity<List<Atendimento>> listarAtendimentos(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(triagemService.listarAtendimentosPorPaciente(idPaciente));
    }

    @PatchMapping("/api/atendimentos/{id}/encerrar")
    public ResponseEntity<Atendimento> encerrar(@PathVariable Long id) {
        return ResponseEntity.ok(triagemService.encerrarAtendimento(id));
    }
}
