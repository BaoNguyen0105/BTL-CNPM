CREATE TABLE HCMUT_SSO(
    id TEXT PRIMARY KEY, 
    username TEXT NOT NULL, 
    password TEXT NOT NULL
);

INSERT INTO HCMUT_SSO
VALUES ('1','adam_smith', 'adamsmith'),
        ('2','joe_hill','joehill');
