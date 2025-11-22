package com.farmaclick.usuarios.dto;

import lombok.Data;

@Data
public class UsuarioDTO {

    private Integer id;

    private String nombre;
    private String apellido;
    private String telefono;
    private String email;
    private String direccion;

    private String nombreRol;

}
