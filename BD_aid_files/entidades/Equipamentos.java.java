package com.example.application.BD.entidades;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Equipamentos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;


    @OneToMany(mappedBy = "equipamento")
    private List<SalaEquipamento> salas;

    public Equipamentos() {}

    public Equipamentos(String nome) {
        this.nome = nome;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }

    public void setNome(String nome) { this.nome = nome; }

    public void setId(Long id) {
        this.id = id;
    }

    public List<SalaEquipamento> getSalas() {
        return salas;
    }

    public void setSalas(List<SalaEquipamento> salas) {
        this.salas = salas;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Equipamentos equipamentos = (Equipamentos) o;
        return id != null && id.equals(equipamentos.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

}